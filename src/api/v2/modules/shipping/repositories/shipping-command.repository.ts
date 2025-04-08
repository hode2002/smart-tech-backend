import { Inject, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { OrderFull } from '@/prisma/selectors';
import { ORDER_TOKENS } from '@v2/modules/order/constants';
import { IOrderCommandRepository } from '@v2/modules/order/interfaces';
import { IShippingCommandRepository } from '@v2/modules/shipping/interfaces';
import { OrderData } from '@v2/modules/shipping/models';

@Injectable()
export class ShippingCommandRepository implements IShippingCommandRepository {
    constructor(
        @Inject(ORDER_TOKENS.SERVICES.ORDER_COMMAND)
        private readonly orderCommandRepository: IOrderCommandRepository,
    ) {}

    async createOrder(orderData: OrderData): Promise<OrderFull> {
        return this.orderCommandRepository.create({
            id: orderData.id,
            status: OrderStatus.PROCESSING,
            user: {
                connect: {
                    id: orderData.user_id,
                },
            },
        });
    }

    async updateOrderStatus(id: string, status: OrderStatus): Promise<any> {
        return this.orderCommandRepository.updateStatus(id, status);
    }
}
