import { OrderStatus } from '@prisma/client';
import { Request } from 'express';

import { Pagination } from '@/common/types';
import { OrderFull } from '@/prisma/selectors';
import { CheckoutDto } from '@v2/modules/order/dtos';

export interface IOrderCommandService {
    checkout(req: Request, userId: string, checkoutDto: CheckoutDto): Promise<any>;
    cancel(id: string, userId: string): Promise<any>;
    updateStatus(id: string, status: OrderStatus): Promise<OrderFull>;
}

export interface IOrderQueryService {
    findById(id: string): Promise<OrderFull>;
    findUserOrder(userId: string, id: string): Promise<OrderFull>;
    findByStatus(userId: string, status: OrderStatus): Promise<Pagination<OrderFull>>;
    findAll(page: number, limit: number): Promise<Pagination<OrderFull>>;
    findAllManagement(page: number, limit: number): Promise<Pagination<OrderFull>>;
}
