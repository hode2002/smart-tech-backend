import { Cart } from '@/prisma/selectors';
import {
    CreateCartDto,
    UpdateCartDto,
    ChangeVariantDto,
    DeleteCartDto,
} from '@v2/modules/cart/dto';

export interface ICartQueryService {
    findById(cartId: string): Promise<Cart>;
    findByUserId(userId: string): Promise<Cart>;
    findByVariantId(userId: string, variantId: string): Promise<Cart>;
}

export interface ICartCommandService {
    addItem(userId: string, createCartDto: CreateCartDto): Promise<Cart>;
    changeVariant(userId: string, changeVariantDto: ChangeVariantDto): Promise<Cart>;
    updateQuantity(userId: string, updateCartDto: UpdateCartDto): Promise<Cart>;
    deleteItem(userId: string, deleteCartDto: DeleteCartDto): Promise<boolean>;
    clearItems(userId: string, variantIds: string[]): Promise<boolean>;
}
