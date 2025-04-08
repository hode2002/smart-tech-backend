import { OrderStatus } from '@prisma/client';

import { Pagination } from '@/common/types';
import { OrderFull } from '@/prisma/selectors';
import { OrderCreateInput, OrderUpdateInput } from '@v2/modules/order/types';

export interface IOrderCommandRepository {
    create(data: OrderCreateInput): Promise<OrderFull>;
    update(id: string, data: OrderUpdateInput): Promise<OrderFull>;
    delete(id: string): Promise<boolean>;
    updateStatus(id: string, status: OrderStatus): Promise<OrderFull>;
}

export interface IOrderQueryRepository {
    findById(id: string): Promise<OrderFull>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<Pagination<OrderFull>>;
    findByStatus(
        userId: string,
        status: OrderStatus,
        page?: number,
        limit?: number,
    ): Promise<Pagination<OrderFull>>;
    findAll(page?: number, limit?: number): Promise<Pagination<OrderFull>>;
    findAllManagement(page?: number, limit?: number): Promise<Pagination<OrderFull>>;
}
