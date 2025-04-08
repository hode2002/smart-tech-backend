import { Inject, Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';

import { PAYMENT_TOKENS } from '@v2/modules/payment/constants';
import { IPaymentFactory, IPaymentService } from '@v2/modules/payment/interfaces';

@Injectable()
export class PaymentFactory implements IPaymentFactory {
    constructor(
        @Inject(PAYMENT_TOKENS.PROVIDERS.COD)
        private readonly codService: IPaymentService,
        @Inject(PAYMENT_TOKENS.PROVIDERS.VNPAY)
        private readonly vnpayService: IPaymentService,
    ) {}

    createPaymentService(method: PaymentMethod): IPaymentService {
        switch (method) {
            case PaymentMethod.COD:
                return this.codService;
            case PaymentMethod.VNPAY:
                return this.vnpayService;
            default:
                throw new Error('Unsupported payment method');
        }
    }
}
