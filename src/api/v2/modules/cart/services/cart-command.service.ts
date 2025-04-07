import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Cart } from '@/prisma/selectors';
import { CacheService } from '@v2/modules/cache/cache.service';
import { CART_TOKENS } from '@v2/modules/cart/constants';
import {
    CreateCartDto,
    UpdateCartDto,
    ChangeVariantDto,
    DeleteCartDto,
} from '@v2/modules/cart/dto';
import { ICartCommandRepository, ICartQueryService } from '@v2/modules/cart/interfaces';
import { ICartCommandService } from '@v2/modules/cart/interfaces/cart.service.interface';
import { PRODUCT_TOKENS } from '@v2/modules/product/constants';
import { IProductQueryService } from '@v2/modules/product/interfaces';
import { USER_TOKENS } from '@v2/modules/user/constants';
import { IUserQueryService } from '@v2/modules/user/interfaces';

@Injectable()
export class CartCommandService implements ICartCommandService {
    constructor(
        @Inject(CART_TOKENS.REPOSITORIES.COMMAND)
        private readonly commandRepository: ICartCommandRepository,
        @Inject(CART_TOKENS.SERVICES.QUERY)
        private readonly cartQueryService: ICartQueryService,
        @Inject(USER_TOKENS.SERVICES.USER_QUERY_SERVICE)
        private readonly userQueryService: IUserQueryService,
        @Inject(PRODUCT_TOKENS.SERVICES.PRODUCT_QUERY)
        private readonly productQueryService: IProductQueryService,
        private readonly cacheService: CacheService,
    ) {}

    async addItem(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
        const { variantId, quantity } = createCartDto;

        const user = await this.userQueryService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userCart = await this.cartQueryService.findByVariantId(userId, variantId);

        let cart: Cart;
        if (!userCart) {
            cart = await this.commandRepository.create(userId, createCartDto);
        } else {
            cart = await this.commandRepository.update(userCart.id, variantId, {
                quantity: userCart.items.reduce((acc, item) => acc + item.quantity, 0) + quantity,
            });
        }

        await Promise.all([
            this.cacheService.del(`cart_user_${userId}_product_${variantId}`),
            this.cacheService.del(`cart_products_user_${userId}`),
        ]);

        return cart;
    }

    async changeVariant(userId: string, changeVariantDto: ChangeVariantDto): Promise<Cart> {
        const { oldVariantId, newVariantId } = changeVariantDto;

        const user = await this.userQueryService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userCart = await this.cartQueryService.findByVariantId(userId, oldVariantId);
        if (!userCart) {
            throw new NotFoundException('Product does not exist in cart');
        }

        const productVariant = await this.productQueryService.findById(newVariantId);
        if (!productVariant) {
            throw new NotFoundException('Product not found');
        }

        const cartItem = await this.commandRepository.changeVariant(
            userCart.id,
            oldVariantId,
            newVariantId,
        );

        await Promise.all([
            this.cacheService.del(`cart_user_${userId}_product_${oldVariantId}`),
            this.cacheService.del(`cart_user_${userId}_product_${newVariantId}`),
            this.cacheService.del(`cart_products_user_${userId}`),
        ]);

        return cartItem;
    }

    async updateQuantity(userId: string, updateCartDto: UpdateCartDto): Promise<Cart> {
        const { variantId, quantity } = updateCartDto;

        const user = await this.userQueryService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userCart = await this.cartQueryService.findByVariantId(userId, variantId);
        if (!userCart) {
            throw new NotFoundException('Product does not exist in cart');
        }

        const productVariant = await this.productQueryService.findById(variantId);
        if (!productVariant) {
            throw new NotFoundException('Product not found');
        }

        const cartItemUpdated = await this.commandRepository.update(userCart.id, variantId, {
            quantity,
        });

        await Promise.all([
            this.cacheService.del(`cart_user_${userId}_product_${variantId}`),
            this.cacheService.del(`cart_products_user_${userId}`),
        ]);

        return cartItemUpdated;
    }

    async deleteItem(userId: string, deleteCartDto: DeleteCartDto): Promise<boolean> {
        const { variantId } = deleteCartDto;

        const user = await this.userQueryService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userCart = await this.cartQueryService.findByVariantId(userId, variantId);
        if (!userCart) {
            throw new NotFoundException('Product does not exist in cart');
        }

        const productVariant = await this.productQueryService.findById(variantId);
        if (!productVariant) {
            throw new NotFoundException('Product not found');
        }

        const [isDeleted] = await Promise.all([
            this.commandRepository.delete(userCart.id),
            this.cacheService.del(`cart_user_${userId}_product_${variantId}`),
            this.cacheService.del(`cart_products_user_${userId}`),
        ]);

        return !!isDeleted;
    }

    async clearItems(userId: string, variantIds: string[]): Promise<boolean> {
        return this.commandRepository.clearItems(userId, variantIds);
    }
}
