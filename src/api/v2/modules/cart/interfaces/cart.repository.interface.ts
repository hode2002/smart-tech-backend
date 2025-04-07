import { Cart } from '@/prisma/selectors';
import { CreateCartDto } from '@v2/modules/cart/dto';

export interface ICartQueryRepository {
    findById(cartId: string): Promise<Cart>;
    findByUserId(userId: string): Promise<Cart>;
    findByVariantId(userId: string, variantId: string): Promise<Cart>;
}

export interface ICartCommandRepository {
    create(userId: string, createCartDto: CreateCartDto): Promise<Cart>;
    update(cartId: string, variantId: string, data: { quantity: number }): Promise<Cart>;
    changeVariant(cartId: string, oldVariantId: string, newVariantId: string): Promise<Cart>;
    delete(cartId: string): Promise<boolean>;
    clearItems(userId: string, variantIds: string[]): Promise<boolean>;
}
