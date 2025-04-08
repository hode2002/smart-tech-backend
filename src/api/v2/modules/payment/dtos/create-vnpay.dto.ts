import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVnpayDto {
    @ApiProperty({
        description: 'Amount',
        example: 100000,
    })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({
        description: 'Bank Code',
        example: 'VNBANK',
    })
    @IsString()
    @IsOptional()
    bankCode?: 'VNBANK';

    @ApiProperty({
        description: 'Language',
        example: 'vn',
    })
    @IsString()
    @IsOptional()
    language?: 'vn';
}
