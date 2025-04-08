import { Pagination } from '@/common/types';
import { VoucherBasic } from '@/prisma/selectors';
import {
    OrderVoucherCreateInput,
    VoucherCreateInput,
    VoucherUpdateInput,
    VoucherWhereInput,
    VoucherWhereUniqueInput,
} from '@v2/modules/voucher/types';

export interface IVoucherQueryRepository {
    findFirst<T>(where: VoucherWhereInput, select?: any): Promise<T>;
    findById(id: string): Promise<VoucherBasic>;
    findMany(
        page: number,
        limit: number,
        where?: VoucherWhereInput,
    ): Promise<Pagination<VoucherBasic>>;
    findByVoucherCodes(voucherCodes: string[]): Promise<VoucherBasic[]>;
}

export interface IVoucherCommandRepository {
    create(data: VoucherCreateInput): Promise<VoucherBasic>;
    createOrderVoucher(data: OrderVoucherCreateInput): Promise<boolean>;
    update(where: VoucherWhereUniqueInput, data: VoucherUpdateInput): Promise<VoucherBasic>;
    restore(id: string): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}
