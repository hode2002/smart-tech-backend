import { OrderFull } from '@/prisma/selectors';
import { OrderData } from '@v2/modules/shipping/models';
import { OrderShippingCreateInput } from '@v2/modules/shipping/types';

export interface IShippingQueryRepository {
    findOrderById(orderId: string): Promise<any>;
}

export interface IShippingCommandRepository {
    create(orderData: OrderShippingCreateInput): Promise<OrderFull>;
    createOrder(orderData: OrderData): Promise<OrderFull>;
    updateOrderStatus(id: string, status: string): Promise<any>;
    cancelOrder(orderLabel: string): Promise<any>;
}
