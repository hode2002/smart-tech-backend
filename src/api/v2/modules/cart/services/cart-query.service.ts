import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Cart } from '@/prisma/selectors';
import { CacheService } from '@v2/modules/cache/cache.service';
import { CART_TOKENS } from '@v2/modules/cart/constants';
import { ICartQueryRepository, ICartQueryService } from '@v2/modules/cart/interfaces';
import { USER_TOKENS } from '@v2/modules/user/constants';
import { IUserQueryService } from '@v2/modules/user/interfaces';

@Injectable()
export class CartQueryService implements ICartQueryService {
    constructor(
        @Inject(CART_TOKENS.REPOSITORIES.QUERY)
        private readonly queryRepository: ICartQueryRepository,
        @Inject(USER_TOKENS.SERVICES.USER_QUERY_SERVICE)
        private readonly userQueryService: IUserQueryService,
        private readonly cacheService: CacheService,
    ) {}

    async findById(cartId: string): Promise<Cart> {
        const cacheKey = `cart_${cartId}`;
        const cacheData = await this.cacheService.get<Cart>(cacheKey);
        if (cacheData) {
            return cacheData;
        }

        const cart = await this.queryRepository.findById(cartId);
        if (cart) {
            await this.cacheService.set(cacheKey, cart);
        }
        return cart;
    }

    async findByUserId(userId: string): Promise<Cart> {
        const cacheKey = `cart_products_user_${userId}`;
        const cacheData = await this.cacheService.get<Cart>(cacheKey);
        if (cacheData) {
            return cacheData;
        }

        const user = await this.userQueryService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const items = await this.queryRepository.findByUserId(userId);
        await this.cacheService.set(cacheKey, items);

        return items;
    }

    async findByVariantId(userId: string, variantId: string): Promise<Cart> {
        const cacheKey = `cart_user_${userId}_product_${variantId}`;
        const cacheData = await this.cacheService.get<Cart>(cacheKey);
        if (cacheData) {
            return cacheData;
        }

        const item = await this.queryRepository.findByVariantId(userId, variantId);
        if (item) {
            await this.cacheService.set(cacheKey, item);
        }
        return item;
    }
}
