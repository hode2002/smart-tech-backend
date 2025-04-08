import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { IShippingQueryRepository } from '@v2/modules/shipping/interfaces';

@Injectable()
export class ShippingQueryRepository implements IShippingQueryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOrderById(id: string): Promise<any> {
        return this.prisma.order.findUnique({ where: { id } });
    }
}
