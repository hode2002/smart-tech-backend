import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { PaymentService } from '@/api/v2/modules/payment/payments.service';
import { CommonModule } from '@v2/modules/common/common.module';
import { PAYMENT_TOKENS } from '@v2/modules/payment/constants';
import { PaymentFactory } from '@v2/modules/payment/factory/payment.factory';
import { PaymentCommandRepository, PaymentQueryRepository } from '@v2/modules/payment/repositories';
import { VNPayService } from '@v2/modules/payment/services/vnpay.service';
import { ProductModule } from '@v2/modules/product/product.module';
import { UserModule } from '@v2/modules/user/user.module';

@Module({
    imports: [CommonModule, UserModule, ProductModule, CacheModule.register({})],
    providers: [
        {
            provide: PAYMENT_TOKENS.REPOSITORIES.COMMAND,
            useClass: PaymentCommandRepository,
        },
        {
            provide: PAYMENT_TOKENS.REPOSITORIES.QUERY,
            useClass: PaymentQueryRepository,
        },
        {
            provide: PAYMENT_TOKENS.PROVIDERS.VNPAY,
            useClass: VNPayService,
        },
        {
            provide: PAYMENT_TOKENS.PAYMENT_SERVICE,
            useClass: PaymentService,
        },
        {
            provide: PAYMENT_TOKENS.PAYMENT_FACTORY,
            useClass: PaymentFactory,
        },
    ],
    exports: [
        PAYMENT_TOKENS.PAYMENT_SERVICE,
        PAYMENT_TOKENS.PROVIDERS.VNPAY,
        PAYMENT_TOKENS.REPOSITORIES.COMMAND,
        PAYMENT_TOKENS.REPOSITORIES.QUERY,
        PAYMENT_TOKENS.PAYMENT_FACTORY,
    ],
})
export class PaymentModule {}
