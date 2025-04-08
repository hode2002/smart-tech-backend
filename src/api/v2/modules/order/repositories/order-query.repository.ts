import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { formatPagination } from '@/common/helpers';
import { Pagination } from '@/common/types';
import { PrismaService } from '@/prisma/prisma.service';
import { OrderFull, ORDER_FULL_SELECT } from '@/prisma/selectors';
import { IOrderQueryRepository } from '@v2/modules/order/interfaces';

@Injectable()
export class OrderQueryRepository implements IOrderQueryRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async findById(id: string): Promise<OrderFull> {
        return this.prismaService.order.findUnique({
            where: { id },
            select: ORDER_FULL_SELECT,
        });
    }

    async findByUserId(userId: string, page = 1, limit = 10): Promise<Pagination<OrderFull>> {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prismaService.order.findMany({
                skip,
                take: limit,
                where: { user_id: userId },
                select: ORDER_FULL_SELECT,
            }),
            this.prismaService.order.count({ where: { user_id: userId } }),
        ]);

        return formatPagination({ orders }, total, page, limit);
    }

    async findByStatus(
        userId: string,
        status: OrderStatus,
        page = 1,
        limit = 10,
    ): Promise<Pagination<OrderFull>> {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prismaService.order.findMany({
                skip,
                take: limit,
                where: { user_id: userId, status },
                select: ORDER_FULL_SELECT,
            }),
            this.prismaService.order.count({ where: { user_id: userId, status } }),
        ]);

        return formatPagination({ orders }, total, page, limit);
    }

    async findAll(page = 1, limit = 10): Promise<Pagination<OrderFull>> {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prismaService.order.findMany({
                skip,
                take: limit,
                select: ORDER_FULL_SELECT,
            }),
            this.prismaService.order.count(),
        ]);

        return formatPagination({ orders }, total, page, limit);
    }

    async findAllManagement(page = 1, limit = 10): Promise<Pagination<OrderFull>> {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prismaService.order.findMany({
                skip,
                take: limit,
                select: ORDER_FULL_SELECT,
            }),
            this.prismaService.order.count(),
        ]);

        return formatPagination({ orders }, total, page, limit);
    }
}
