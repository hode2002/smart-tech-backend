import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateDeliveryDto {
    @ApiPropertyOptional({
        description: 'Name of the delivery method',
        example: 'Express Delivery',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        description: 'Status of the delivery method',
    })
    @IsEnum(DeliveryStatus)
    @IsOptional()
    status?: DeliveryStatus;
}
