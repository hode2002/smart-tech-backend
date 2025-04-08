import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Inject,
    BadRequestException,
} from '@nestjs/common';
import { VoucherStatus } from '@prisma/client';

import { generateCode } from '@/common/utils/generate-voucher-code';
import { VOUCHER_ORDER_SELECT, VoucherOrder, VoucherBasic } from '@/prisma/selectors';
import { ORDER_TOKENS } from '@v2/modules/order/constants';
import { IOrderQueryService } from '@v2/modules/order/interfaces';
import { VOUCHER_TOKENS } from '@v2/modules/voucher/constants';
import { CreateVoucherDto, UpdateVoucherDto } from '@v2/modules/voucher/dtos';
import {
    IVoucherCommandRepository,
    IVoucherCommandService,
    IVoucherQueryService,
} from '@v2/modules/voucher/interfaces';

@Injectable()
export class VoucherCommandService implements IVoucherCommandService {
    constructor(
        @Inject(VOUCHER_TOKENS.SERVICES.VOUCHER_QUERY_SERVICE)
        private readonly voucherQueryService: IVoucherQueryService,
        @Inject(VOUCHER_TOKENS.REPOSITORIES.VOUCHER_COMMAND_REPOSITORY)
        private readonly voucherCommandRepo: IVoucherCommandRepository,
        @Inject(ORDER_TOKENS.SERVICES.ORDER_QUERY)
        private readonly orderQueryService: IOrderQueryService,
    ) {}

    async create(createVoucherDto: CreateVoucherDto): Promise<VoucherBasic> {
        let voucherCode: string;

        if (createVoucherDto?.code) {
            await this.voucherQueryService.findByVoucherCode(createVoucherDto?.code);
            voucherCode = createVoucherDto?.code;
        } else {
            voucherCode = generateCode(10);
        }

        const data = {
            ...createVoucherDto,
            code: voucherCode,
            status: VoucherStatus.INACTIVE,
        };

        return this.voucherCommandRepo.create(data);
    }

    async update(id: string, updateVoucherDto: UpdateVoucherDto): Promise<VoucherBasic> {
        if (updateVoucherDto?.code) {
            await this.voucherQueryService.findFirst<VoucherBasic>({
                code: updateVoucherDto.code,
                id: { not: id },
            });
        }

        return this.voucherCommandRepo.update({ id }, updateVoucherDto);
    }

    async delete(id: string): Promise<boolean> {
        return this.voucherCommandRepo.delete(id);
    }

    async restore(id: string): Promise<boolean> {
        return this.voucherCommandRepo.restore(id);
    }

    async applyVoucherToOrder(orderId: string, voucherCodes: string[]): Promise<boolean> {
        if (!voucherCodes?.length) {
            throw new BadRequestException('At least one voucher code is required');
        }

        const order = await this.orderQueryService.findById(orderId);
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        const vouchers = await this.voucherQueryService.findByVoucherCodes(voucherCodes);
        if (vouchers.length !== voucherCodes.length) {
            const foundCodes = vouchers.map(v => v.code);
            const missingCodes = voucherCodes.filter(code => !foundCodes.includes(code));
            throw new NotFoundException(`Voucher codes not found: ${missingCodes.join(', ')}`);
        }

        await Promise.all(
            vouchers.map(voucher =>
                this.voucherQueryService.checkValidVoucher(order.user.id, {
                    voucherCode: voucher.code,
                    totalOrderPrice: order.total_amount,
                }),
            ),
        );

        const existingVouchers = await this.voucherQueryService.findFirst<VoucherOrder>(
            { code: { in: voucherCodes } },
            VOUCHER_ORDER_SELECT,
        );

        const duplicateVouchers = existingVouchers?.order_vouchers
            .filter(ov => ov.order_id === orderId)
            .map(ov => ov.voucher.code);

        if (duplicateVouchers?.length) {
            throw new ForbiddenException(
                `Vouchers already used in this order: ${duplicateVouchers.join(', ')}`,
            );
        }

        const results = await Promise.all(
            vouchers.map(async voucher => {
                try {
                    const isCreated = await this.voucherCommandRepo.createOrderVoucher({
                        order: { connect: { id: orderId } },
                        voucher: { connect: { id: voucher.id } },
                    });

                    if (!isCreated) {
                        throw new BadRequestException(`Failed to apply voucher ${voucher.code}`);
                    }

                    await this.voucherCommandRepo.update(
                        { id: voucher.id },
                        { quantity: { decrement: 1 } },
                    );

                    return true;
                } catch (error) {
                    throw new BadRequestException(
                        `Failed to apply voucher ${voucher.code}: ${error.message}`,
                    );
                }
            }),
        );

        return results.every(result => result);
    }
}
