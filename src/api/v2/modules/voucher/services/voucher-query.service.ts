import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { VoucherType, VoucherStatus } from '@prisma/client';
import moment from 'moment';

import { Pagination } from '@/common/types';
import { VOUCHER_BASIC_SELECT, VoucherBasic } from '@/prisma/selectors';
import { VOUCHER_TOKENS } from '@v2/modules/voucher/constants';
import { CheckValidVoucherDto } from '@v2/modules/voucher/dtos';
import { IVoucherQueryRepository, IVoucherQueryService } from '@v2/modules/voucher/interfaces';
import { VoucherWhereInput } from '@v2/modules/voucher/types';

@Injectable()
export class VoucherQueryService implements IVoucherQueryService {
    constructor(
        @Inject(VOUCHER_TOKENS.REPOSITORIES.VOUCHER_QUERY_REPOSITORY)
        private readonly voucherQueryRepo: IVoucherQueryRepository,
    ) {}

    async calculateVoucherDiscount(voucherCodes: string[], totalPrice: number): Promise<number> {
        let voucherDiscount = 0;

        if (!voucherCodes || voucherCodes.length === 0) {
            return voucherDiscount;
        }

        for (const voucherCode of voucherCodes) {
            const voucher = await this.findByVoucherCode(voucherCode);
            if (voucher && voucher.status === VoucherStatus.ACTIVE) {
                if (voucher.type === VoucherType.PERCENTAGE) {
                    voucherDiscount += (totalPrice * voucher.value) / 100;
                } else {
                    voucherDiscount += voucher.value;
                }
            }
        }

        return voucherDiscount;
    }

    checkValidDate(voucher: VoucherBasic) {
        const start_date = moment.utc(voucher.start_date, 'DD-MM-YYYY');
        const end_date = moment.utc(voucher.end_date, 'DD-MM-YYYY');
        const today = moment.utc();

        const isValidDate =
            today.isValid() &&
            start_date.isValid() &&
            end_date.isValid() &&
            start_date.isBefore(end_date) &&
            today.isBetween(start_date, end_date);

        if (!isValidDate) {
            throw new ForbiddenException('Invalid voucher date!');
        }
    }

    checkVoucherExpired(voucher: VoucherBasic) {
        if (voucher.status === VoucherStatus.INACTIVE) {
            throw new ForbiddenException('Voucher expired!');
        }
    }

    async findAll(page: number, limit: number): Promise<Pagination<VoucherBasic>> {
        return await this.voucherQueryRepo.findMany(page, limit);
    }

    async findById(id: string) {
        const voucher = await this.voucherQueryRepo.findById(id);
        if (!voucher) {
            throw new NotFoundException('Voucher not found');
        }
        return voucher;
    }

    async findFirst<T>(where: VoucherWhereInput, select = VOUCHER_BASIC_SELECT): Promise<T> {
        const voucher = await this.voucherQueryRepo.findFirst<T>(where, select);
        if (!voucher) {
            throw new NotFoundException('Voucher not found');
        }
        return voucher;
    }

    async findByVoucherCode(voucherCode: string): Promise<VoucherBasic> {
        const voucher = await this.voucherQueryRepo.findFirst<VoucherBasic>({
            code: voucherCode,
        });
        if (!voucher) {
            throw new NotFoundException('Voucher not found');
        }
        return voucher;
    }

    async findByVoucherCodes(voucherCodes: string[]): Promise<VoucherBasic[]> {
        const vouchers = await this.voucherQueryRepo.findByVoucherCodes(voucherCodes);
        return vouchers;
    }

    async checkValidVoucher(userId: string, checkValidVoucherDto: CheckValidVoucherDto) {
        const { voucherCode, totalOrderPrice } = checkValidVoucherDto;
        const voucher = await this.findByVoucherCode(voucherCode);

        this.checkVoucherExpired(voucher);
        this.checkValidDate(voucher);

        const userOrderWithVoucher = await this.voucherQueryRepo.findFirst({
            id: voucher.id,
            order_vouchers: {
                some: {
                    order: {
                        user_id: userId,
                    },
                },
            },
        });
        if (userOrderWithVoucher) {
            throw new ForbiddenException(`voucher '${voucherCode}' has already been used!`);
        }

        if (voucher.quantity <= 0) {
            throw new ForbiddenException('Voucher is not available!');
        }

        const isValidVoucher = totalOrderPrice > voucher.min_order_value;
        if (!isValidVoucher) {
            throw new ForbiddenException('Total order value is not enough to activate voucher!');
        }

        return true;
    }
}
