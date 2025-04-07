import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { CART_FULL_SELECT, Cart } from '@/prisma/selectors';
import { CreateCartDto } from '@v2/modules/cart/dto';
import { ICartCommandRepository } from '@v2/modules/cart/interfaces';

@Injectable()
export class CartCommandRepository implements ICartCommandRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
        const { variantId, quantity } = createCartDto;

        return this.prisma.cart.create({
            data: {
                user_id: userId,
                items: {
                    create: {
                        variant_id: variantId,
                        quantity,
                    },
                },
            },
            select: CART_FULL_SELECT,
        });
    }

    async update(cartId: string, variantId: string, data: { quantity: number }): Promise<Cart> {
        const cart = await this.prisma.cart.findUnique({
            where: {
                id: cartId,
                items: { some: { variant_id: variantId } },
            },
            select: {
                user_id: true,
                items: { select: { id: true } },
            },
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        return this.prisma.cartItem.update({
            where: {
                id: cart.items[0].id,
            },
            data,
            select: CART_FULL_SELECT,
        });
    }

    async changeVariant(cartId: string, oldVariantId: string, newVariantId: string): Promise<Cart> {
        const cart = await this.prisma.cart.findUnique({
            where: { id: cartId, items: { some: { variant_id: oldVariantId } } },
            select: {
                user_id: true,
                items: { select: { id: true } },
            },
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        return this.prisma.cartItem.update({
            where: {
                id: cart.items[0].id,
                variant_id: oldVariantId,
            },
            data: {
                variant_id: newVariantId,
            },
            select: CART_FULL_SELECT,
        });
    }

    async delete(cartId: string): Promise<boolean> {
        const result = await this.prisma.cart.delete({
            where: { id: cartId },
        });

        return result !== null;
    }

    async clearItems(userId: string, variantIds: string[]): Promise<boolean> {
        const result = await this.prisma.cartItem.deleteMany({
            where: {
                cart: {
                    user_id: userId,
                },
                variant_id: { in: variantIds },
            },
        });

        return result.count > 0;
    }
}
