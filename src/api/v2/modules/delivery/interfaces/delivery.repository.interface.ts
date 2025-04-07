import { Delivery } from '@prisma/client';

import { Pagination } from '@/common/types';
import {
    DeliveryUpdateInput,
    DeliveryCreateInput,
    DeliveryWhereInput,
    DeliveryWhereUniqueInput,
} from '@v2/modules/delivery/types';

export interface IDeliveryQueryRepository {
    findById(id: string, where?: DeliveryWhereUniqueInput): Promise<Delivery>;
    findBySlug(slug: string, where?: DeliveryWhereInput): Promise<Delivery>;
    findAll(page: number, limit: number, where?: DeliveryWhereInput): Promise<Pagination<Delivery>>;
}

export interface IDeliveryCommandRepository {
    create(data: DeliveryCreateInput): Promise<Delivery>;
    update(id: string, data: DeliveryUpdateInput): Promise<Delivery>;
    softDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
    permanentlyDelete(id: string): Promise<boolean>;
}

export interface IDeliveryRepository extends IDeliveryQueryRepository, IDeliveryCommandRepository {}
