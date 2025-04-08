import { Injectable } from '@nestjs/common';

import { IPaymentService } from '@v2/modules/payment/interfaces';

@Injectable()
export class CODService implements IPaymentService {
    async processPayment(order: any): Promise<any> {
        return { success: true };
    }
}
