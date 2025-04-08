import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, ShippingMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
    @ApiProperty({
        description: 'Shipping method',
        enum: ShippingMethod,
    })
    @IsEnum(ShippingMethod)
    @IsNotEmpty()
    shippingMethod: ShippingMethod;

    @ApiProperty({
        description: 'Payment method',
        enum: PaymentMethod,
    })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;

    @ApiProperty({
        description: 'Shipping info',
    })
    @Type(() => ShippingInfoDto)
    @IsNotEmpty()
    shippingInfo: ShippingInfoDto;

    @ApiProperty({
        description: 'Items',
    })
    @Type(() => CheckoutItemDto)
    @IsNotEmpty()
    items: CheckoutItemDto[];

    @ApiProperty({
        description: 'Voucher codes',
        required: false,
    })
    @IsOptional()
    voucherCodes?: string[];
}

export class ShippingInfoDto {
    @ApiProperty({
        description: 'Pick province',
    })
    @IsString()
    @IsNotEmpty()
    pickProvince: string;

    @ApiProperty({
        description: 'Pick district',
    })
    @IsString()
    @IsNotEmpty()
    pickDistrict: string;

    @ApiProperty({
        description: 'Province',
    })
    @IsString()
    @IsNotEmpty()
    province: string;

    @ApiProperty({
        description: 'District',
    })
    @IsString()
    @IsNotEmpty()
    district: string;

    @ApiProperty({
        description: 'Address',
    })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({
        description: 'Ward',
    })
    @IsString()
    @IsNotEmpty()
    ward: string;

    @ApiProperty({
        description: 'Tel',
    })
    @IsString()
    @IsNotEmpty()
    tel: string;
}

export class CheckoutItemDto {
    @ApiProperty({
        description: 'Variant ID',
    })
    @IsString()
    @IsNotEmpty()
    variant_id: string;

    @ApiProperty({
        description: 'Quantity',
    })
    @IsNumber()
    @IsNotEmpty()
    quantity: number;
}
