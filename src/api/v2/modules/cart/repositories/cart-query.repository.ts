import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { CART_FULL_SELECT, Cart } from '@/prisma/selectors';
import { ICartQueryRepository } from '@v2/modules/cart/interfaces';

@Injectable()
export class CartQueryRepository implements ICartQueryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByUserId(userId: string): Promise<Cart> {
        return this.prisma.cart.findFirst({
            where: { user_id: userId },
            orderBy: { created_at: 'asc' },
            select: CART_FULL_SELECT,
        });
    }

    async findById(cartId: string): Promise<Cart> {
        return this.prisma.cart.findUnique({
            where: { id: cartId },
            select: CART_FULL_SELECT,
        });
    }

    async findByVariantId(userId: string, variantId: string): Promise<Cart> {
        return this.prisma.cart.findFirst({
            where: { user_id: userId, items: { some: { variant_id: variantId } } },
            select: CART_FULL_SELECT,
        });
    }
}
