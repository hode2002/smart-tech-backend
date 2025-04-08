import { Payment, PaymentStatus } from '@prisma/client';

import { formatPagination } from '@/common/helpers';
import { Pagination } from '@/common/types';
import { PrismaService } from '@/prisma/prisma.service';
import { IPaymentQueryRepository } from '@v2/modules/payment/interfaces';

export class PaymentQueryRepository implements IPaymentQueryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByOrderId(orderId: string): Promise<Payment> {
        return this.prisma.payment.findUnique({
            where: { order_id: orderId },
        });
    }

    async findByStatus(page = 1, limit = 10, status: PaymentStatus): Promise<Pagination<Payment>> {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                skip,
                take: limit,
                where: { status },
            }),
            this.prisma.payment.count({ where: { status } }),
        ]);

        return formatPagination({ payments }, total, page, limit);
    }
}
