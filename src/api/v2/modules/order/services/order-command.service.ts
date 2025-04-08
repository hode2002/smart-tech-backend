import {
    Inject,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { PaymentService } from '@/api/v2/modules/payment/payments.service';
import { OrderData } from '@/api/v2/modules/shipping/models';
import { Cart, OrderFull } from '@/prisma/selectors';
import { CART_TOKENS } from '@v2/modules/cart/constants';
import { ICartCommandService, ICartQueryService } from '@v2/modules/cart/interfaces';
import { ORDER_TOKENS } from '@v2/modules/order/constants/injection-tokens';
import { CheckoutDto } from '@v2/modules/order/dtos';
import {
    IOrderCommandService,
    IOrderCommandRepository,
    IOrderQueryRepository,
} from '@v2/modules/order/interfaces';
import { PRODUCT_TOKENS } from '@v2/modules/product/constants';
import { IVariantQueryService } from '@v2/modules/product/interfaces';
import { ShippingService } from '@v2/modules/shipping/shipping.service';
import { USER_TOKENS } from '@v2/modules/user/constants';
import { IUserQueryService } from '@v2/modules/user/interfaces';
import { VOUCHER_TOKENS } from '@v2/modules/voucher/constants';
import { IVoucherCommandService, IVoucherQueryService } from '@v2/modules/voucher/interfaces';

@Injectable()
export class OrderCommandService implements IOrderCommandService {
    constructor(
        private readonly shippingService: ShippingService,
        private readonly paymentService: PaymentService,
        @Inject(ORDER_TOKENS.REPOSITORIES.ORDER_COMMAND)
        private readonly commandRepository: IOrderCommandRepository,
        @Inject(ORDER_TOKENS.REPOSITORIES.ORDER_QUERY)
        private readonly queryRepository: IOrderQueryRepository,
        @Inject(USER_TOKENS.SERVICES.USER_QUERY_SERVICE)
        private readonly userQueryService: IUserQueryService,
        @Inject(VOUCHER_TOKENS.SERVICES.VOUCHER_QUERY_SERVICE)
        private readonly voucherQueryService: IVoucherQueryService,
        @Inject(VOUCHER_TOKENS.SERVICES.VOUCHER_COMMAND_SERVICE)
        private readonly voucherCommandService: IVoucherCommandService,
        @Inject(CART_TOKENS.SERVICES.QUERY)
        private readonly cartQueryService: ICartQueryService,
        @Inject(CART_TOKENS.SERVICES.COMMAND)
        private readonly cartCommandService: ICartCommandService,
        @Inject(PRODUCT_TOKENS.SERVICES.VARIANT_QUERY)
        private readonly variantQueryService: IVariantQueryService,
    ) {}

    private calculateTotalWeight = (cart: Cart) => {
        return cart.items.reduce(
            (total, item) => total + item.product_variant.weight * item.quantity,
            0,
        );
    };

    private calculateTotalPrice = (cart: Cart, shippingFee: number) => {
        return (
            cart.items.reduce(
                (total, item) => total + item.product_variant.price * item.quantity,
                0,
            ) + shippingFee
        );
    };

    async checkout(req: Request, userId: string, checkoutDto: CheckoutDto) {
        const user = await this.userQueryService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const cart = await this.cartQueryService.findByUserId(userId);
        if (!cart.items.length) {
            throw new NotFoundException('Cart is empty');
        }

        const { shippingMethod, paymentMethod, shippingInfo, items, voucherCodes } = checkoutDto;

        const checkoutItemsPromise = items.map(async item => {
            const variant = await this.variantQueryService.findById(item.variant_id);
            if (variant.stock_quantity < item.quantity) {
                throw new UnprocessableEntityException(
                    `${variant.product.name} - ${variant.sku} out of stock`,
                );
            }

            return {
                variant_id: variant.id,
                quantity: item.quantity,
                price: variant.price,
                subtotal: variant.price * item.quantity,
            };
        });

        const checkoutItems = await Promise.all(checkoutItemsPromise);

        const shippingFee = await this.shippingService.calculateShippingFee(shippingMethod, {
            pickProvince: shippingInfo.pickProvince,
            pickDistrict: shippingInfo.pickDistrict,
            province: shippingInfo.province,
            district: shippingInfo.district,
            ward: shippingInfo.ward,
            weight: this.calculateTotalWeight(cart),
        });

        const totalPrice = this.calculateTotalPrice(cart, shippingFee.fee);

        let voucherDiscount = 0;
        if (voucherCodes && voucherCodes.length > 0) {
            voucherDiscount = await this.voucherQueryService.calculateVoucherDiscount(
                voucherCodes,
                totalPrice,
            );
        }

        const order = {
            id: uuidv4(),
            user: {
                connect: {
                    id: userId,
                },
            },
            order_items: {
                create: checkoutItems,
            },
            shipping_fee: shippingFee.fee,
            total: totalPrice - voucherDiscount,
            status: OrderStatus.PENDING,
            shipping: {
                create: {
                    delivery: {
                        connect: {
                            slug: shippingMethod,
                        },
                    },
                    full_name: user.full_name,
                    phone: user.phone,
                    ...shippingInfo,
                    address_line: shippingInfo.address,
                    method: shippingMethod,
                    fee: shippingFee.fee,
                },
            },
        };

        await Promise.all([
            this.commandRepository.create(order),
            this.voucherCommandService.applyVoucherToOrder(order.id, voucherCodes),
        ]);

        const paymentResult = await this.paymentService.processPayment(
            req,
            order.id,
            totalPrice - voucherDiscount,
            paymentMethod,
        );

        if (!(paymentMethod === PaymentMethod.COD || paymentResult.paymentUrl)) {
            throw new UnprocessableEntityException('Payment processing failed');
        }

        if (paymentMethod === PaymentMethod.COD) {
            const orderData: OrderData = {
                id: order.id,
                user_id: userId,
                name: user.full_name ?? user.email,
                address: checkoutDto.shippingInfo.address,
                province: checkoutDto.shippingInfo.province,
                district: checkoutDto.shippingInfo.district,
                ward: checkoutDto.shippingInfo.ward,
                tel: checkoutDto.shippingInfo.tel,
                products: cart.items.map(item => ({
                    id: item.product_variant.id,
                    name: item.product_variant.product.name + ' - ' + item.product_variant.sku,
                    weight: item.product_variant.weight,
                    quantity: item.quantity,
                })),
            };

            const shippingResult = await this.shippingService.createOrder(
                shippingMethod,
                orderData,
            );

            if (shippingResult.success) {
                await this.cartCommandService.clearItems(
                    userId,
                    checkoutItems.map(item => item.variant_id),
                );
                return { orderId: order.id, trackingCode: shippingResult.order.label };
            } else {
                await this.commandRepository.updateStatus(order.id, OrderStatus.FAILED);
                throw new UnprocessableEntityException(`Failed to create ${shippingMethod} order`);
            }
        }

        return { orderId: order.id, paymentUrl: paymentResult.paymentUrl };
    }

    async handlePaymentIPN(method: PaymentMethod, body: any) {
        const result = await this.paymentService.handleIPN(method, body);
        if (result.RspCode === '00' && result.success) {
            const orderId = body.vnp_TxnRef;

            const payment = await this.paymentService.findByOrderId(orderId);
            if (!payment) {
                throw new NotFoundException('Payment not found');
            }

            await this.paymentService.updateStatus(payment.id, PaymentStatus.SUCCESS);

            const order = await this.queryRepository.findById(orderId);
            const orderData: OrderData = {
                id: order.id,
                user_id: order.user.id,
                name: order.user.full_name ?? order.user.email,
                address: order.shipping.address_line,
                province: order.shipping.province,
                district: order.shipping.district,
                ward: order.shipping.ward,
                tel: order.shipping.tel,
                products: order.order_items.map(item => ({
                    id: item.product_variants.id,
                    name: item.product_variants.product.name + ' - ' + item.product_variants.sku,
                    weight: item.product_variants.weight,
                    quantity: item.quantity,
                })),
            };

            const shippingResult = await this.shippingService.createOrder(
                order.shipping.method,
                orderData,
            );

            if (shippingResult.success) {
                await Promise.all([
                    this.cartCommandService.clearItems(
                        order.user.id,
                        order.order_items.map(item => item.product_variants.id),
                    ),
                    this.commandRepository.updateStatus(order.id, OrderStatus.CONFIRMED),
                ]);
            } else {
                await this.commandRepository.updateStatus(order.id, OrderStatus.FAILED);
            }
        }
        return result;
    }

    async cancel(userId: string, id: string) {
        const order = await this.queryRepository.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.user.id !== userId) {
            throw new NotFoundException('Order not found for this user');
        }

        if (order.shipping.order_label && this.shippingService) {
            try {
                await this.shippingService.cancelShippingOrder(
                    order.shipping.method,
                    order.shipping.order_label,
                );
            } catch (error) {
                console.error('Failed to cancel shipping order:', error);
            }
        }

        await this.commandRepository.updateStatus(id, OrderStatus.CANCELLED);

        return true;
    }

    async updateStatus(id: string, status: OrderStatus): Promise<OrderFull> {
        const order = await this.queryRepository.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return this.commandRepository.updateStatus(id, status);
    }
}
