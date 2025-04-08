import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Payment, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { ORDER_TOKENS } from '@v2/modules/order/constants';
import { IOrderQueryService } from '@v2/modules/order/interfaces';
import { PAYMENT_TOKENS } from '@v2/modules/payment/constants';
import { PaymentFactory } from '@v2/modules/payment/factory/payment.factory';
import { IPaymentCommandRepository, IPaymentQueryRepository } from '@v2/modules/payment/interfaces';
import { PaymentCreateInput, PaymentUpdateInput } from '@v2/modules/payment/types';

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentFactory: PaymentFactory,
        @Inject(PAYMENT_TOKENS.REPOSITORIES.COMMAND)
        private readonly commandRepository: IPaymentCommandRepository,
        @Inject(PAYMENT_TOKENS.REPOSITORIES.QUERY)
        private readonly queryRepository: IPaymentQueryRepository,
        @Inject(ORDER_TOKENS.SERVICES.ORDER_QUERY)
        private readonly orderQueryService: IOrderQueryService,
    ) {}

    async create(payment: PaymentCreateInput): Promise<Payment> {
        return this.commandRepository.create(payment);
    }

    async update(id: string, data: PaymentUpdateInput): Promise<Payment> {
        return this.commandRepository.update(id, data);
    }

    async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
        return this.commandRepository.updateStatus(id, status);
    }

    async findByOrderId(orderId: string): Promise<Payment> {
        return this.queryRepository.findByOrderId(orderId);
    }

    async processPayment(
        req: Request,
        orderId: string,
        amount: number,
        paymentMethod: PaymentMethod,
    ): Promise<any> {
        const order = await this.orderQueryService.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const paymentService = this.paymentFactory.createPaymentService(paymentMethod);
        const payment = {
            id: uuidv4(),
            order: {
                connect: {
                    id: orderId,
                },
            },
            method: paymentMethod,
            status: PaymentStatus.PENDING,
            amount,
        };

        const [paymentUrl] = await Promise.all([
            paymentService.processPayment(req, order),
            this.commandRepository.create(payment),
        ]);

        return { paymentUrl };
    }

    async handleIPN(method: PaymentMethod, body: any): Promise<any> {
        const paymentService = this.paymentFactory.createPaymentService(method);
        if (!paymentService.handleIPN) {
            return { RspCode: '00', Message: 'No IPN required' };
        }
        const result = await paymentService.handleIPN(body);
        if (result.RspCode === '00') {
            const paymentId = body.vnp_TxnRef;
            const status = result.success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
            await this.updateStatus(paymentId, status);
        }
        return result;
    }
}
