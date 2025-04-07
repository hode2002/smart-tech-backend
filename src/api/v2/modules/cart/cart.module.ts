import { Module } from '@nestjs/common';

import { ProductModule, UserModule } from '@v2/modules';
import { CacheModule } from '@v2/modules/cache/cache.module';
import { CartController } from '@v2/modules/cart/cart.controller';
import { CART_TOKENS } from '@v2/modules/cart/constants';
import { CartCommandRepository, CartQueryRepository } from '@v2/modules/cart/repositories';
import { CartCommandService, CartQueryService } from '@v2/modules/cart/services';
import { CommonModule } from '@v2/modules/common/common.module';

@Module({
    imports: [CommonModule, UserModule, ProductModule, CacheModule.register({})],
    controllers: [CartController],
    providers: [
        {
            provide: CART_TOKENS.REPOSITORIES.COMMAND,
            useClass: CartCommandRepository,
        },
        {
            provide: CART_TOKENS.REPOSITORIES.QUERY,
            useClass: CartQueryRepository,
        },
        {
            provide: CART_TOKENS.SERVICES.COMMAND,
            useClass: CartCommandService,
        },
        {
            provide: CART_TOKENS.SERVICES.QUERY,
            useClass: CartQueryService,
        },
    ],
    exports: [
        CART_TOKENS.SERVICES.COMMAND,
        CART_TOKENS.SERVICES.QUERY,
        CART_TOKENS.REPOSITORIES.COMMAND,
        CART_TOKENS.REPOSITORIES.QUERY,
    ],
})
export class CartModule {}
