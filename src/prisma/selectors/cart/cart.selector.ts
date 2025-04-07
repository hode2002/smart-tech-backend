import { Prisma } from '@prisma/client';

import { PRODUCT_VARIANT_SELECT, USER_PROFILE_SELECT } from '@/prisma/selectors';

export const CART_BASIC_SELECT = {
    id: true,
    user_id: true,
    created_at: true,
    updated_at: true,
} as const;

export const CART_ITEM_BASIC_SELECT = {
    id: true,
    variant_id: true,
    product_variant: {
        select: PRODUCT_VARIANT_SELECT,
    },
    quantity: true,
} as const;

export type CartBasic = Prisma.CartItemGetPayload<{
    select: typeof CART_BASIC_SELECT;
}>;

export const CART_FULL_SELECT = {
    ...CART_BASIC_SELECT,
    items: {
        select: CART_ITEM_BASIC_SELECT,
    },
    user: {
        select: USER_PROFILE_SELECT,
    },
} as const;

export type Cart = Prisma.CartGetPayload<{
    select: typeof CART_FULL_SELECT;
}>;
