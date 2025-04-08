import { Request } from 'express';

import { OrderFull } from '@/prisma/selectors';

export interface IPaymentService {
    processPayment(req: Request, order: OrderFull): Promise<string>;
    handleIPN?(body: any): Promise<any>;
}
