import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { Pagination } from '@/common/types';
import { OrderFull } from '@/prisma/selectors';
import { ORDER_TOKENS } from '@v2/modules/order/constants/injection-tokens';
import { IOrderQueryRepository, IOrderQueryService } from '@v2/modules/order/interfaces';

@Injectable()
export class OrderQueryService implements IOrderQueryService {
    constructor(
        @Inject(ORDER_TOKENS.REPOSITORIES.ORDER_QUERY)
        private readonly queryRepository: IOrderQueryRepository,
    ) {}

    async findById(id: string): Promise<OrderFull> {
        const order = await this.queryRepository.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async findUserOrder(id: string, userId: string): Promise<OrderFull> {
        const order = await this.queryRepository.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.user.id !== userId) {
            throw new NotFoundException('Order not found for this user');
        }

        return order;
    }

    async findByStatus(userId: string, status: OrderStatus): Promise<Pagination<OrderFull>> {
        return this.queryRepository.findByStatus(userId, status);
    }

    async findAll(page: number, limit: number): Promise<Pagination<OrderFull>> {
        return this.queryRepository.findAll(page, limit);
    }

    async findAllManagement(page: number, limit: number): Promise<Pagination<OrderFull>> {
        return this.queryRepository.findAllManagement(page, limit);
    }
}
