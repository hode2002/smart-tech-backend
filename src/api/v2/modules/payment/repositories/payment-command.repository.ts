import { Injectable } from '@nestjs/common';
import { Payment, PaymentStatus } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { IPaymentCommandRepository } from '@v2/modules/payment/interfaces';
import { PaymentCreateInput, PaymentUpdateInput } from '@v2/modules/payment/types';

@Injectable()
export class PaymentCommandRepository implements IPaymentCommandRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: PaymentCreateInput): Promise<Payment> {
        return this.prisma.payment.create({ data });
    }

    async update(id: string, data: PaymentUpdateInput): Promise<Payment> {
        return this.prisma.payment.update({
            where: { id },
            data,
        });
    }

    async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
        return this.prisma.payment.update({
            where: { id },
            data: { status },
        });
    }
}
