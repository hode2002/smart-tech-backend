import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { CreateGHTKOrder } from '@v2/modules/order/types';
import { PRODUCT_TOKENS } from '@v2/modules/product/constants';
import { IVariantQueryService } from '@v2/modules/product/interfaces';
import { GetStatusDto, FeeDataDto } from '@v2/modules/shipping/dtos';
import { IShippingService } from '@v2/modules/shipping/interfaces';
import { OrderData, ProductVariant } from '@v2/modules/shipping/models';
@Injectable()
export class GHTKService implements IShippingService {
    private readonly API_URL: string;
    private readonly TOKEN: string;
    private readonly PICK_NAME: string;
    private readonly PICK_ADDRESS: string;
    private readonly PICK_PROVINCE: string;
    private readonly PICK_DISTRICT: string;
    private readonly PICK_WARD: string;
    private readonly PICK_TEL: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @Inject(PRODUCT_TOKENS.SERVICES.VARIANT_QUERY)
        private readonly productVariantQueryService: IVariantQueryService,
    ) {
        this.API_URL = this.configService.get('GHTK_API_URL');
        this.TOKEN = this.configService.get('GHTK_API_TOKEN_KEY');
        this.PICK_NAME = this.configService.get('PICK_NAME');
        this.PICK_ADDRESS = this.configService.get('PICK_ADDRESS');
        this.PICK_PROVINCE = this.configService.get('PICK_PROVINCE');
        this.PICK_DISTRICT = this.configService.get('PICK_DISTRICT');
        this.PICK_WARD = this.configService.get('PICK_WARD');
        this.PICK_TEL = this.configService.get('PICK_TEL');
    }

    getName(): string {
        return 'GHTK';
    }

    private async calculateTotalPrice(productVariants: ProductVariant[]): Promise<number> {
        let totalPrice = 0;
        for (const item of productVariants) {
            const productVariant = await this.productVariantQueryService.findById(item.id);
            totalPrice += (productVariant.price - productVariant.discount) * item.quantity;
        }
        return totalPrice;
    }

    async createOrder(orderData: OrderData): Promise<any> {
        const totalPrice = await this.calculateTotalPrice(orderData.products);

        const order: CreateGHTKOrder = {
            id: orderData.id,
            pick_name: this.PICK_NAME,
            pick_address: this.PICK_ADDRESS,
            pick_province: this.PICK_PROVINCE,
            pick_district: this.PICK_DISTRICT,
            pick_ward: this.PICK_WARD,
            pick_tel: this.PICK_TEL,
            tel: orderData.tel,
            name: orderData.name,
            address: orderData.address,
            province: orderData.province,
            district: orderData.district,
            ward: orderData.ward,
            pick_date: new Date().toISOString().split('T')[0],
            pick_money: Math.round(totalPrice),
            value: Math.round(totalPrice),
            transport: 'road',
            tags: [1, 2],
        };

        const response = await firstValueFrom(
            this.httpService.post(
                `${this.API_URL}/services/shipment/order`,
                {
                    products: orderData.products,
                    order,
                },
                {
                    headers: { Token: this.TOKEN },
                },
            ),
        );
        return response.data;
    }

    async calculateShippingFee(feeData: FeeDataDto): Promise<any> {
        const response = await firstValueFrom(
            this.httpService.get(`${this.API_URL}/services/shipment/fee`, {
                headers: { Token: this.TOKEN },
                params: feeData,
            }),
        );
        return response.data;
    }

    async getOrderStatus(getOrderStatusDto: GetStatusDto): Promise<any> {
        const response = await firstValueFrom(
            this.httpService.get(
                `${this.API_URL}/services/shipment/v2/${getOrderStatusDto.trackingCode}`,
                {
                    headers: { Token: this.TOKEN },
                },
            ),
        );
        return response.data;
    }

    async cancelOrder(orderLabel: string): Promise<any> {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.API_URL}/services/shipment/cancel`,
                {
                    order_label: orderLabel,
                },
                {
                    headers: { Token: this.TOKEN },
                },
            ),
        );
        return response.data;
    }
}
