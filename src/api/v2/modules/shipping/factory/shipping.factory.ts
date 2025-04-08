import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ShippingMethod } from '@prisma/client';

import { SHIPPING_TOKENS } from '@v2/modules/shipping/constants';
import { IShippingService, IShippingFactory } from '@v2/modules/shipping/interfaces';

@Injectable()
export class ShippingFactory implements IShippingFactory {
    constructor(
        @Inject(SHIPPING_TOKENS.SERVICE_PROVIDERS.GHTK)
        private readonly ghtkService: IShippingService,
    ) {}

    createShippingService(method: ShippingMethod): IShippingService {
        switch (method) {
            case ShippingMethod.GHTK:
                return this.ghtkService;
            default:
                throw new NotFoundException('Unsupported shipping method');
        }
    }
}
