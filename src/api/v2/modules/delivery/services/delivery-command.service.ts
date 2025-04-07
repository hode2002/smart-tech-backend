import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryStatus } from '@prisma/client';

import { generateSlug } from '@/common/utils';
import { CacheService } from '@v2/modules/cache/cache.service';
import { DELIVERY_TOKENS } from '@v2/modules/delivery/constants';
import { CreateDeliveryDto, UpdateDeliveryDto } from '@v2/modules/delivery/dto';
import {
    IDeliveryCommandRepository,
    IDeliveryCommandService,
    IDeliveryQueryService,
} from '@v2/modules/delivery/interfaces';

@Injectable()
export class DeliveryCommandService implements IDeliveryCommandService {
    constructor(
        private readonly cacheService: CacheService,
        @Inject(DELIVERY_TOKENS.COMMAND_REPOSITORY)
        private readonly commandRepository: IDeliveryCommandRepository,
        @Inject(DELIVERY_TOKENS.QUERY_SERVICE)
        private readonly deliveryQueryService: IDeliveryQueryService,
    ) {}

    async create(createDeliveryDto: CreateDeliveryDto) {
        const slug = generateSlug(createDeliveryDto.name);

        const existingDelivery = await this.deliveryQueryService.findBySlug(slug);
        if (existingDelivery) {
            throw new ConflictException('Delivery Already Exists');
        }

        await this.cacheService.deleteByPattern('deliveries_*');

        const data = {
            ...createDeliveryDto,
            slug,
        };

        const delivery = await this.commandRepository.create(data);
        await this.invalidateCache(delivery.id, delivery.slug);

        return delivery;
    }

    async update(id: string, updateDeliveryDto: UpdateDeliveryDto) {
        const delivery = await this.deliveryQueryService.findById(id);
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }

        const [result] = await Promise.all([
            this.commandRepository.update(id, {
                ...updateDeliveryDto,
                slug: generateSlug(updateDeliveryDto.name),
            }),
            this.invalidateCache(id, delivery.slug),
        ]);

        await this.invalidateCache(id, delivery.slug);

        return result;
    }

    async softDelete(id: string) {
        const delivery = await this.deliveryQueryService.findById(id);
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }

        const result = await this.commandRepository.softDelete(id);

        await Promise.all([
            this.cacheService.del(`delivery_id_${id}`),
            this.cacheService.del(`delivery_slug_${delivery.slug}`),
            this.cacheService.deleteByPattern('deliveries_*'),
        ]);

        return !!result;
    }

    async permanentlyDelete(id: string) {
        const delivery = await this.deliveryQueryService.findById(id);

        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }

        const result = await Promise.all([
            this.commandRepository.permanentlyDelete(id),
            this.invalidateCache(id, delivery.slug),
        ]);

        return !!result;
    }

    async restore(id: string) {
        const delivery = await this.deliveryQueryService.findById(id);

        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }

        const result = await Promise.all([
            this.commandRepository.update(id, {
                status: DeliveryStatus.ACTIVE,
            }),
            this.invalidateCache(id, delivery.slug),
        ]);

        return !!result;
    }

    private async invalidateCache(id: string, slug: string) {
        await Promise.all([
            this.cacheService.del(`delivery_id_${id}`),
            this.cacheService.del(`delivery_slug_${slug}`),
            this.cacheService.deleteByPattern('deliveries_*'),
        ]);
    }
}
