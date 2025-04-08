import { Pagination } from '@/common/types';
import { VoucherBasic } from '@/prisma/selectors';
import { CheckValidVoucherDto, CreateVoucherDto, UpdateVoucherDto } from '@v2/modules/voucher/dtos';
import { VoucherWhereInput } from '@v2/modules/voucher/types';

export interface IVoucherQueryService {
    findAll(page: number, limit: number): Promise<Pagination<VoucherBasic>>;
    findFirst<T>(where: VoucherWhereInput, select?: any): Promise<T>;
    findById(id: string): Promise<VoucherBasic>;
    findByVoucherCode(voucherCode: string): Promise<VoucherBasic>;
    findByVoucherCodes(voucherCodes: string[]): Promise<VoucherBasic[]>;
    checkValidDate(voucher: VoucherBasic): void;
    checkVoucherExpired(voucher: VoucherBasic): void;
    checkValidVoucher(userId: string, checkValidVoucherDto: CheckValidVoucherDto): Promise<boolean>;
    calculateVoucherDiscount(voucherCodes: string[], totalPrice: number): Promise<number>;
}

export interface IVoucherCommandService {
    create(createVoucherDto: CreateVoucherDto): Promise<VoucherBasic>;
    update(id: string, updateVoucherDto: UpdateVoucherDto): Promise<VoucherBasic>;
    delete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
    applyVoucherToOrder(orderId: string, voucherCodes: string[]): Promise<boolean>;
}

export interface IVoucherService extends IVoucherQueryService, IVoucherCommandService {}
