import { Inject, Injectable } from '@nestjs/common';
import { Delivery, DeliveryStatus } from '@prisma/client';

import { Pagination } from '@/common/types';
import { CacheService } from '@v2/modules/cache/cache.service';
import { DELIVERY_TOKENS } from '@v2/modules/delivery/constants';
import { IDeliveryQueryRepository, IDeliveryQueryService } from '@v2/modules/delivery/interfaces';
import { DeliveryWhereInput, DeliveryWhereUniqueInput } from '@v2/modules/delivery/types';

@Injectable()
export class DeliveryQueryService implements IDeliveryQueryService {
    constructor(
        private readonly cacheService: CacheService,
        @Inject(DELIVERY_TOKENS.QUERY_REPOSITORY)
        private readonly deliveryQueryRepository: IDeliveryQueryRepository,
    ) {}

    async findAll(page = 1, limit = 10): Promise<Pagination<Delivery>> {
        const cacheKey = `deliveries_${page}_${limit}`;

        const cachedData = await this.cacheService.get<Pagination<Delivery>>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const result = await this.deliveryQueryRepository.findAll(page, limit, {
            status: {
                not: DeliveryStatus.ACTIVE,
            },
        });
        await this.cacheService.set(cacheKey, result);

        return result;
    }

    async findAllManagement(page = 1, limit = 10): Promise<Pagination<Delivery>> {
        const cacheKey = `deliveries_management_${page}_${limit}`;

        const cachedData = await this.cacheService.get<Pagination<Delivery>>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const result = await this.deliveryQueryRepository.findAll(page, limit);
        await this.cacheService.set(cacheKey, result);

        return result;
    }

    async findById(id: string, where?: DeliveryWhereUniqueInput): Promise<Delivery> {
        const cacheKey = `delivery_id_${id}`;
        const cachedData = await this.cacheService.get<Delivery>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        const result = await this.deliveryQueryRepository.findById(id, where);
        if (result) {
            await this.cacheService.set(cacheKey, result);
        }

        return result;
    }

    async findBySlug(slug: string, where?: DeliveryWhereInput): Promise<Delivery> {
        const cacheKey = `delivery_slug_${slug}`;
        const cachedData = await this.cacheService.get<Delivery>(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        const result = await this.deliveryQueryRepository.findBySlug(slug, where);
        if (result) {
            await this.cacheService.set(cacheKey, result);
        }

        return result;
    }
}
