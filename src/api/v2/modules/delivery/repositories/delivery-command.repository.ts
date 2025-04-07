import { Injectable } from '@nestjs/common';
import { Delivery, DeliveryStatus } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { IDeliveryCommandRepository } from '@v2/modules/delivery/interfaces';
import { DeliveryCreateInput, DeliveryUpdateInput } from '@v2/modules/delivery/types';

@Injectable()
export class DeliveryCommandRepository implements IDeliveryCommandRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: DeliveryCreateInput): Promise<Delivery> {
        return this.prisma.delivery.create({
            data,
        });
    }

    async update(id: string, data: DeliveryUpdateInput): Promise<Delivery> {
        return this.prisma.delivery.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: string): Promise<boolean> {
        return this.updateStatus(id, DeliveryStatus.INACTIVE);
    }

    async restore(id: string): Promise<boolean> {
        return this.updateStatus(id, DeliveryStatus.ACTIVE);
    }

    async permanentlyDelete(id: string): Promise<boolean> {
        const result = await this.prisma.delivery.delete({
            where: { id },
        });
        return !!result;
    }

    private async updateStatus(id: string, status: DeliveryStatus): Promise<boolean> {
        const result = await this.prisma.delivery.update({
            where: { id },
            data: { status },
        });
        return !!result;
    }
}
