import { Module } from '@nestjs/common';

import { CacheModule } from '@v2/modules/cache/cache.module';
import { CacheService } from '@v2/modules/cache/cache.service';
import { CommonModule } from '@v2/modules/common/common.module';
import { CommonService } from '@v2/modules/common/common.service';
import { DELIVERY_TOKENS } from '@v2/modules/delivery/constants';
import { DeliveryController } from '@v2/modules/delivery/delivery.controller';
import {
    DeliveryCommandRepository,
    DeliveryQueryRepository,
} from '@v2/modules/delivery/repositories';
import { DeliveryCommandService, DeliveryQueryService } from '@v2/modules/delivery/services';

@Module({
    imports: [CommonModule, CacheModule.register({})],
    controllers: [DeliveryController],
    providers: [
        CommonService,
        CacheService,
        {
            provide: DELIVERY_TOKENS.QUERY_REPOSITORY,
            useClass: DeliveryQueryRepository,
        },
        {
            provide: DELIVERY_TOKENS.COMMAND_REPOSITORY,
            useClass: DeliveryCommandRepository,
        },
        {
            provide: DELIVERY_TOKENS.QUERY_SERVICE,
            useClass: DeliveryQueryService,
        },
        {
            provide: DELIVERY_TOKENS.COMMAND_SERVICE,
            useClass: DeliveryCommandService,
        },
    ],
    exports: [
        DELIVERY_TOKENS.QUERY_SERVICE,
        DELIVERY_TOKENS.COMMAND_SERVICE,
        DELIVERY_TOKENS.QUERY_REPOSITORY,
        DELIVERY_TOKENS.COMMAND_REPOSITORY,
    ],
})
export class DeliveryModule {}
