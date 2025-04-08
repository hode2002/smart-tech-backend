import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CommonModule } from '@v2/modules/common/common.module';
import { DELIVERY_TOKENS } from '@v2/modules/delivery/constants';
import { DeliveryModule } from '@v2/modules/delivery/delivery.module';
import { DeliveryQueryService } from '@v2/modules/delivery/services/delivery-query.service';
import { OrderModule } from '@v2/modules/order/order.module';
import { PRODUCT_TOKENS } from '@v2/modules/product/constants';
import { ProductModule } from '@v2/modules/product/product.module';
import { VariantQueryService } from '@v2/modules/product/services/queries/variant-query.service';
import { SHIPPING_TOKENS } from '@v2/modules/shipping/constants';
import { ShippingFactory } from '@v2/modules/shipping/factory/shipping.factory';
import {
    ShippingCommandRepository,
    ShippingQueryRepository,
} from '@v2/modules/shipping/repositories';
import { GHTKService } from '@v2/modules/shipping/services/ghtk.service';
import { ShippingController } from '@v2/modules/shipping/shipping.controller';
import { ShippingService } from '@v2/modules/shipping/shipping.service';

@Module({
    imports: [CommonModule, HttpModule, OrderModule, DeliveryModule, ProductModule],
    controllers: [ShippingController],
    providers: [
        {
            provide: PRODUCT_TOKENS.SERVICES.VARIANT_QUERY,
            useClass: VariantQueryService,
        },
        {
            provide: DELIVERY_TOKENS.QUERY_SERVICE,
            useClass: DeliveryQueryService,
        },
        {
            provide: SHIPPING_TOKENS.SHIPPING_SERVICE,
            useClass: ShippingService,
        },
        {
            provide: SHIPPING_TOKENS.SERVICE_PROVIDERS.GHTK,
            useClass: GHTKService,
        },
        {
            provide: SHIPPING_TOKENS.REPOSITORIES.SHIPPING_QUERY,
            useClass: ShippingQueryRepository,
        },
        {
            provide: SHIPPING_TOKENS.REPOSITORIES.SHIPPING_COMMAND,
            useClass: ShippingCommandRepository,
        },
        {
            provide: SHIPPING_TOKENS.SHIPPING_FACTORY,
            useClass: ShippingFactory,
        },
    ],
    exports: [
        SHIPPING_TOKENS.SHIPPING_SERVICE,
        SHIPPING_TOKENS.SERVICE_PROVIDERS.GHTK,
        SHIPPING_TOKENS.REPOSITORIES.SHIPPING_QUERY,
        SHIPPING_TOKENS.REPOSITORIES.SHIPPING_COMMAND,
        SHIPPING_TOKENS.SHIPPING_FACTORY,
    ],
})
export class ShippingModule {}
