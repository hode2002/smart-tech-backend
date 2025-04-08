import { Prisma } from '@prisma/client';

export const VOUCHER_BASIC_SELECT = {
    id: true,
    code: true,
    name: true,
    type: true,
    value: true,
    min_order_value: true,
    max_discount: true,
    quantity: true,
    start_date: true,
    end_date: true,
    status: true,
    created_at: true,
    updated_at: true,
} as const;

export const VOUCHER_ORDER_SELECT = {
    ...VOUCHER_BASIC_SELECT,
    order_vouchers: {
        select: {
            id: true,
            order_id: true,
            voucher: {
                select: {
                    id: true,
                    code: true,
                },
            },
        },
    },
} as const;

export type VoucherBasic = Prisma.VoucherGetPayload<{
    select: typeof VOUCHER_BASIC_SELECT;
}>;

export type VoucherOrder = Prisma.VoucherGetPayload<{
    select: typeof VOUCHER_ORDER_SELECT;
}>;
