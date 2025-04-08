import { Controller, Body, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';

import { ResponseMessage } from '@/common/decorators';
import { AtJwtGuard } from '@v2/modules/auth/guards';
import { FeeDataDto } from '@v2/modules/shipping/dtos';
import { IShippingService } from '@v2/modules/shipping/interfaces';

@Controller('shipping')
export class ShippingController {
    constructor(private readonly shippingService: IShippingService) {}

    @Post('fee')
    @ApiOperation({ summary: 'Calculate shipping fee' })
    @ApiBody({ type: FeeDataDto })
    @ApiResponse({
        status: 200,
        description: 'Returns calculated shipping fee',
    })
    @ResponseMessage('Get shipping fee success')
    @UseGuards(AtJwtGuard)
    @HttpCode(HttpStatus.OK)
    async calculateFee(@Body() feeDataDto: FeeDataDto) {
        return this.shippingService.calculateShippingFee(feeDataDto);
    }
}
