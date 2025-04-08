import { PaymentMethod } from '@prisma/client';

import { IPaymentService } from '@v2/modules/payment/interfaces';

export interface IPaymentFactory {
    createPaymentService(method: PaymentMethod): IPaymentService;
}
