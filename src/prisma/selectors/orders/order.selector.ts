import { Prisma } from '@prisma/client';

import { PRODUCT_VARIANT_SELECT } from '@/prisma/selectors/products';

export const ORDER_USER_SELECT = {
    id: true,
    email: true,
    avatar: true,
    full_name: true,
} as const;

export const ORDER_BRAND_SELECT = {
    id: true,
    name: true,
    slug: true,
    logo_url: true,
} as const;

export const ORDER_CATEGORY_SELECT = {
    id: true,
    name: true,
    slug: true,
} as const;

export const ORDER_DESCRIPTION_SELECT = {
    id: true,
    content: true,
} as const;

export const ORDER_SHIPPING_SELECT = {
    id: true,
    full_name: true,
    phone: true,
    address_line: true,
    province: true,
    district: true,
    ward: true,
    tel: true,
    fee: true,
    method: true,
    estimated_date: true,
    tracking_code: true,
    order_label: true,
    delivery: {
        select: {
            name: true,
            slug: true,
        },
    },
} as const;

export const ORDER_PAYMENT_SELECT = {
    id: true,
    payment_method: true,
    total_price: true,
    transaction_id: true,
} as const;

export const ORDER_ITEM_SELECT = {
    id: true,
    product_variants: {
        select: PRODUCT_VARIANT_SELECT,
    },
    price: true,
    quantity: true,
    subtotal: true,
} as const;

export const ORDER_BASIC_SELECT = {
    id: true,
    order_number: true,
    total_amount: true,
    shipping_fee: true,
    status: true,
    note: true,
    created_at: true,
} as const;

export const ORDER_FULL_SELECT = {
    ...ORDER_BASIC_SELECT,
    user: {
        select: ORDER_USER_SELECT,
    },
    shipping: {
        select: ORDER_SHIPPING_SELECT,
    },
    payment: {
        select: ORDER_PAYMENT_SELECT,
    },
    order_items: {
        select: ORDER_ITEM_SELECT,
    },
} as const;

export const ORDER_CANCEL_SELECT = {
    order_items: {
        select: {
            product_variants: {
                select: {
                    thumbnail: true,
                },
            },
        },
    },
    user_id: true,
    payment: {
        select: {
            transaction_id: true,
        },
    },
} as const;

export const ORDER_UPDATE_STATUS_SELECT = {
    id: true,
    status: true,
} as const;

export const ORDER_FIND_BY_STATUS_SELECT = {
    ...ORDER_FULL_SELECT,
    orderBy: {
        created_at: 'desc',
    },
} as const;

export type OrderBasic = Prisma.OrderGetPayload<{
    select: typeof ORDER_BASIC_SELECT;
}>;

export type OrderFull = Prisma.OrderGetPayload<{
    select: typeof ORDER_FULL_SELECT;
}>;

export type OrderCancel = Prisma.OrderGetPayload<{
    select: typeof ORDER_CANCEL_SELECT;
}>;

export type OrderUpdateStatus = Prisma.OrderGetPayload<{
    select: typeof ORDER_UPDATE_STATUS_SELECT;
}>;

export type OrderFindByStatus = Prisma.OrderGetPayload<{
    select: typeof ORDER_FIND_BY_STATUS_SELECT;
}>;
