import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, ShippingMethod } from '@prisma/client';

import { DELIVERY_TOKENS } from '@v2/modules/delivery/constants';
import { IDeliveryQueryService } from '@v2/modules/delivery/interfaces';
import { SHIPPING_TOKENS } from '@v2/modules/shipping/constants';
import { GetStatusDto, FeeDataDto } from '@v2/modules/shipping/dtos';
import {
    IShippingCommandRepository,
    IShippingFactory,
    IShippingQueryRepository,
} from '@v2/modules/shipping/interfaces';
import { OrderData } from '@v2/modules/shipping/models';

@Injectable()
export class ShippingService {
    constructor(
        @Inject(SHIPPING_TOKENS.SHIPPING_FACTORY)
        private readonly shippingFactory: IShippingFactory,
        @Inject(SHIPPING_TOKENS.REPOSITORIES.SHIPPING_QUERY)
        private readonly queryRepository: IShippingQueryRepository,
        @Inject(SHIPPING_TOKENS.REPOSITORIES.SHIPPING_COMMAND)
        private readonly commandRepository: IShippingCommandRepository,
        @Inject(DELIVERY_TOKENS.QUERY_SERVICE)
        private readonly deliveryQueryService: IDeliveryQueryService,
    ) {}

    async createOrder(method: ShippingMethod, orderData: OrderData): Promise<any> {
        const order = await this.queryRepository.findOrderById(orderData.id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Order is not pending');
        }

        const delivery = await this.deliveryQueryService.findBySlug(method);
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }

        const shippingService = this.shippingFactory.createShippingService(method);
        return shippingService.createOrder(orderData);
    }

    async calculateShippingFee(method: ShippingMethod, feeData: FeeDataDto): Promise<any> {
        const shippingService = this.shippingFactory.createShippingService(method);
        return shippingService.calculateShippingFee(feeData);
    }

    async getOrderStatus(method: ShippingMethod, getOrderStatusDto: GetStatusDto): Promise<any> {
        const shippingService = this.shippingFactory.createShippingService(method);
        const status = await shippingService.getOrderStatus(getOrderStatusDto);
        if (status.success) {
            const order = await this.queryRepository.findOrderById(getOrderStatusDto.trackingCode);
            if (order) {
                await this.commandRepository.updateOrderStatus(order.id, status.order.status_text);
            }
        }
        return status;
    }

    async cancelShippingOrder(method: ShippingMethod, orderLabel: string): Promise<any> {
        const shippingService = this.shippingFactory.createShippingService(method);
        return shippingService.cancelOrder(orderLabel);
    }
}
