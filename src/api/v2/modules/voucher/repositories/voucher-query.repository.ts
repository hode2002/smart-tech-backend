import { Injectable } from '@nestjs/common';

import { formatPagination } from '@/common/helpers';
import { Pagination } from '@/common/types';
import { PrismaService } from '@/prisma/prisma.service';
import { VOUCHER_BASIC_SELECT, VoucherBasic } from '@/prisma/selectors';
import { IVoucherQueryRepository } from '@v2/modules/voucher/interfaces';
import { VoucherWhereInput } from '@v2/modules/voucher/types';

@Injectable()
export class VoucherQueryRepository implements IVoucherQueryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<VoucherBasic> {
        return this.prisma.voucher.findUnique({ where: { id }, select: VOUCHER_BASIC_SELECT });
    }

    async findFirst<T>(where: VoucherWhereInput, select = VOUCHER_BASIC_SELECT): Promise<T> {
        return this.prisma.voucher.findFirst({ where, select }) as T;
    }

    async findMany(
        page: number,
        limit: number,
        where?: VoucherWhereInput,
    ): Promise<Pagination<VoucherBasic>> {
        const skip = (page - 1) * limit;
        const [vouchers, total] = await Promise.all([
            this.prisma.voucher.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'asc' },
                select: VOUCHER_BASIC_SELECT,
            }),
            this.prisma.voucher.count({ where }),
        ]);
        return formatPagination({ vouchers }, total, page, limit);
    }

    async findByVoucherCodes(voucherCodes: string[]): Promise<VoucherBasic[]> {
        return this.prisma.voucher.findMany({
            where: { code: { in: voucherCodes } },
            select: VOUCHER_BASIC_SELECT,
        });
    }
}
