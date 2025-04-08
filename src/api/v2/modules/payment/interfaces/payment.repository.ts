import { Payment, PaymentStatus } from '@prisma/client';

import { Pagination } from '@/common/types';
import { PaymentCreateInput, PaymentUpdateInput } from '@v2/modules/payment/types';

export interface IPaymentCommandRepository {
    create(payment: PaymentCreateInput): Promise<Payment>;
    update(id: string, data: PaymentUpdateInput): Promise<Payment>;
    updateStatus(id: string, status: PaymentStatus): Promise<Payment>;
}

export interface IPaymentQueryRepository {
    findByStatus(page: number, limit: number, status: PaymentStatus): Promise<Pagination<Payment>>;
    findByOrderId(orderId: string): Promise<Payment>;
}
