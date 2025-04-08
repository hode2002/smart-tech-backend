import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { authConfig, bullConfig, mailConfig, mongooseConfig, throttlerConfig } from '@/config';
import { PrismaModule } from '@/prisma/prisma.module';
import { NotificationModule } from '@v1/modules';
import {
    AuthModule,
    OtpModule,
    HealthModule,
    BrandModule,
    BannerModule,
    MediaModule,
    CategoryModule,
    DeliveryModule,
    HistorySearchModule,
    NewsModule,
    MailModule,
    RedisModule,
    UserModule,
    VoucherModule,
    CartModule,
    ProductModule,
    ReviewModule,
    OrderModule,
    ShippingModule,
} from '@v2/modules';

@Module({
    imports: [
        ConfigModule.forRoot({ load: [authConfig, mailConfig], isGlobal: true }),
        BullModule.forRootAsync(bullConfig),
        MongooseModule.forRootAsync(mongooseConfig),
        ThrottlerModule.forRoot([throttlerConfig]),
        PrismaModule,
        RedisModule,
        AuthModule,
        UserModule,
        MailModule,
        BrandModule,
        BannerModule,
        CategoryModule,
        ProductModule,
        MediaModule,
        HistorySearchModule,
        CartModule,
        DeliveryModule,
        OrderModule,
        ReviewModule,
        NewsModule,
        NotificationModule,
        VoucherModule,
        HealthModule,
        OtpModule,
        ShippingModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
