import { Injectable } from '@nestjs/common';

import { formatPagination } from '@/common/helpers';
import { PrismaService } from '@/prisma/prisma.service';
import { DELIVERY_FULL_SELECT } from '@/prisma/selectors';
import { IDeliveryQueryRepository } from '@v2/modules/delivery/interfaces';
import { DeliveryWhereInput, DeliveryWhereUniqueInput } from '@v2/modules/delivery/types';

@Injectable()
export class DeliveryQueryRepository implements IDeliveryQueryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(page: number, limit: number, where: DeliveryWhereInput) {
        const skip = (page - 1) * limit;
        const [deliveries, total] = await Promise.all([
            this.prisma.delivery.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'asc' },
                select: DELIVERY_FULL_SELECT,
            }),
            this.prisma.delivery.count({ where }),
        ]);
        return formatPagination({ deliveries }, total, page, limit);
    }

    async findById(id: string, where?: DeliveryWhereUniqueInput) {
        return this.prisma.delivery.findUnique({
            where: { id, ...where },
            select: DELIVERY_FULL_SELECT,
        });
    }

    async findBySlug(slug: string) {
        return this.prisma.delivery.findUnique({
            where: { slug },
            select: DELIVERY_FULL_SELECT,
        });
    }
}
