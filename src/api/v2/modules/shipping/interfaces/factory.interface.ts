import { ShippingMethod } from '@prisma/client';

import { IShippingService } from '@v2/modules/shipping/interfaces';

export interface IShippingFactory {
    createShippingService(method: ShippingMethod): IShippingService;
}
