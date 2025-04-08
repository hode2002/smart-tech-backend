import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as moment from 'moment';
import * as querystring from 'qs';

import { OrderFull } from '@/prisma/selectors';
import { IPaymentService } from '@v2/modules/payment/interfaces';

@Injectable()
export class VNPayService implements IPaymentService {
    private readonly vnp_TmnCode: string;
    private readonly vnp_HashSecret: string;
    private readonly vnp_Url: string;
    private readonly vnp_ReturnUrl: string;

    constructor(configService: ConfigService) {
        this.vnp_TmnCode = configService.get('vnp_TmnCode');
        this.vnp_HashSecret = configService.get('vnp_HashSecret');
        this.vnp_Url = configService.get('vnp_Url');
        this.vnp_ReturnUrl = configService.get('vnp_ReturnUrl');
    }

    async processPayment(req: Request, order: OrderFull): Promise<string> {
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const amount = order.total_amount * 100;

        const ipAddr =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection['socket'].remoteAddress;

        const locale = 'vn';
        const currCode = 'VND';
        const bankCode = 'VNBANK';

        const params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: this.vnp_TmnCode,
            vnp_Amount: amount.toString(),
            vnp_CreateDate: createDate,
            vnp_CurrCode: currCode,
            vnp_IpAddr: ipAddr,
            vnp_Locale: locale,
            vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: this.vnp_ReturnUrl,
            vnp_TxnRef: order.id,
            vnp_BankCode: bankCode,
        };

        const sortedParams = this.sortObject(params);
        const signData = querystring.stringify(sortedParams, { encode: false });

        const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
        const signed = hmac.update(signData).digest('hex');
        params['vnp_SecureHash'] = signed;
        const vnpUrl = `${this.vnp_Url}?${querystring.stringify(params, { encode: false })}`;

        return vnpUrl;
    }

    async handleIPN(body: any): Promise<any> {
        const secureHash = body.vnp_SecureHash;
        delete body.vnp_SecureHash;
        delete body.vnp_SecureHashType;

        const sortedParams = this.sortObject(body);
        const signData = querystring.stringify(sortedParams, { encode: false });
        const checkHash = crypto
            .createHmac('sha512', this.vnp_HashSecret)
            .update(signData)
            .digest('hex');

        if (secureHash !== checkHash) {
            return { RspCode: '97', Message: 'Checksum failed' };
        }
        return {
            RspCode: '00',
            Message: 'Confirm success',
            success: body.vnp_ResponseCode === '00',
        };
    }

    private sortObject(obj: any): any {
        return Object.keys(obj)
            .sort()
            .reduce((result, key) => {
                result[key] = obj[key];
                return result;
            }, {});
    }
}
