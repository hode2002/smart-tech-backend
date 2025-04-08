import { Injectable } from '@nestjs/common';
import { VoucherStatus } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { VOUCHER_BASIC_SELECT, VoucherBasic } from '@/prisma/selectors';
import { IVoucherCommandRepository } from '@v2/modules/voucher/interfaces';
import {
    OrderVoucherCreateInput,
    VoucherCreateInput,
    VoucherUpdateInput,
    VoucherWhereUniqueInput,
} from '@v2/modules/voucher/types';

@Injectable()
export class VoucherCommandRepository implements IVoucherCommandRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: VoucherCreateInput): Promise<VoucherBasic> {
        return this.prisma.voucher.create({
            data,
            select: VOUCHER_BASIC_SELECT,
        });
    }

    async createOrderVoucher(data: OrderVoucherCreateInput): Promise<boolean> {
        const result = await this.prisma.orderVoucher.create({
            data,
            select: { id: true },
        });

        return !!result;
    }

    async update(where: VoucherWhereUniqueInput, data: VoucherUpdateInput): Promise<VoucherBasic> {
        return this.prisma.voucher.update({
            where,
            data,
            select: VOUCHER_BASIC_SELECT,
        });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.prisma.voucher.update({
            where: { id },
            data: { status: VoucherStatus.INACTIVE },
            select: { id: true },
        });

        return !!result;
    }

    async restore(id: string): Promise<boolean> {
        const result = await this.prisma.voucher.update({
            where: { id },
            data: { status: VoucherStatus.ACTIVE },
            select: { id: true },
        });

        return !!result;
    }
}
