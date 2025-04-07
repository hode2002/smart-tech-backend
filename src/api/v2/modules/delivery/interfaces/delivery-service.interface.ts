import { Delivery } from '@prisma/client';

import { Pagination } from '@/common/types';
import { CreateDeliveryDto, UpdateDeliveryDto } from '@v2/modules/delivery/dto';

export interface IDeliveryQueryService {
    findById(id: string): Promise<Delivery>;
    findBySlug(slug: string): Promise<Delivery>;
    findAll(page: number, limit: number): Promise<Pagination<Delivery>>;
    findAllManagement(page: number, limit: number): Promise<Pagination<Delivery>>;
}

export interface IDeliveryCommandService {
    create(createDeliveryDto: CreateDeliveryDto): Promise<Delivery>;
    update(id: string, updateDeliveryDto: UpdateDeliveryDto): Promise<Delivery>;
    softDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
    permanentlyDelete(id: string): Promise<boolean>;
}
