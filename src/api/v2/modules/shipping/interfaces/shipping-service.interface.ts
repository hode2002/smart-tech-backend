import { GetStatusDto, FeeDataDto } from '@v2/modules/shipping/dtos';
import { OrderData } from '@v2/modules/shipping/models';

export interface IShippingService {
    getName(): string;
    createOrder(orderData: OrderData): Promise<any>;
    calculateShippingFee(feeData: FeeDataDto): Promise<any>;
    getOrderStatus(getOrderStatusDto: GetStatusDto): Promise<any>;
    cancelOrder(orderLabel: string): Promise<any>;
}
