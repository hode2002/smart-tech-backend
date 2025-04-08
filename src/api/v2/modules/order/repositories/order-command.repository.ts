import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { ORDER_FULL_SELECT } from '@/prisma/selectors';
import { OrderFull } from '@/prisma/selectors/orders/order.selector';
import { IOrderCommandRepository } from '@v2/modules/order/interfaces';
import { OrderCreateInput, OrderUpdateInput } from '@v2/modules/order/types';

@Injectable()
export class OrderCommandRepository implements IOrderCommandRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async create(data: OrderCreateInput): Promise<OrderFull> {
        return this.prismaService.order.create({
            data,
            select: ORDER_FULL_SELECT,
        });
    }

    async update(id: string, data: OrderUpdateInput): Promise<OrderFull> {
        return this.prismaService.order.update({
            where: { id },
            data,
            select: ORDER_FULL_SELECT,
        });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.prismaService.order.delete({
            where: { id },
        });
        return !!result;
    }

    async updateStatus(id: string, status: OrderStatus): Promise<OrderFull> {
        return this.prismaService.order.update({
            where: { id },
            data: { status },
            select: ORDER_FULL_SELECT,
        });
    }
}
