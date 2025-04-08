import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CacheModule } from '@v2/modules/cache/cache.module';
import { CommonModule } from '@v2/modules/common/common.module';
import { ORDER_TOKENS } from '@v2/modules/order/constants';
import { OrderController } from '@v2/modules/order/order.controller';
import { OrderCommandRepository, OrderQueryRepository } from '@v2/modules/order/repositories';
import { OrderCommandService, OrderQueryService } from '@v2/modules/order/services';
import { ShippingModule } from '@v2/modules/shipping/shipping.module';
import { USER_TOKENS } from '@v2/modules/user/constants';
import { UserQueryService } from '@v2/modules/user/services/user-query.service';
import { VOUCHER_TOKENS } from '@v2/modules/voucher/constants';
import { VoucherQueryService, VoucherCommandService } from '@v2/modules/voucher/services';
import { VoucherModule } from '@v2/modules/voucher/voucher.module';

@Module({
    imports: [CommonModule, HttpModule, CacheModule.register({}), ShippingModule, VoucherModule],
    controllers: [OrderController],
    providers: [
        {
            provide: VOUCHER_TOKENS.SERVICES.VOUCHER_QUERY_SERVICE,
            useClass: VoucherQueryService,
        },
        {
            provide: VOUCHER_TOKENS.SERVICES.VOUCHER_COMMAND_SERVICE,
            useClass: VoucherCommandService,
        },
        {
            provide: ORDER_TOKENS.REPOSITORIES.ORDER_COMMAND,
            useClass: OrderCommandRepository,
        },
        {
            provide: ORDER_TOKENS.REPOSITORIES.ORDER_QUERY,
            useClass: OrderQueryRepository,
        },
        {
            provide: ORDER_TOKENS.SERVICES.ORDER_COMMAND,
            useClass: OrderCommandService,
        },
        {
            provide: ORDER_TOKENS.SERVICES.ORDER_QUERY,
            useClass: OrderQueryService,
        },
        {
            provide: USER_TOKENS.SERVICES.USER_QUERY_SERVICE,
            useClass: UserQueryService,
        },
        {
            provide: VOUCHER_TOKENS.SERVICES.VOUCHER_QUERY_SERVICE,
            useClass: VoucherQueryService,
        },
    ],
    exports: [
        ORDER_TOKENS.SERVICES.ORDER_COMMAND,
        ORDER_TOKENS.SERVICES.ORDER_QUERY,
        ORDER_TOKENS.REPOSITORIES.ORDER_COMMAND,
        ORDER_TOKENS.REPOSITORIES.ORDER_QUERY,
    ],
})
export class OrderModule {}
