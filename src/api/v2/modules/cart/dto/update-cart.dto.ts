import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateCartDto {
    @ApiProperty({
        description: 'The ID of the product variant to update',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    @IsNotEmpty()
    variantId: string;

    @ApiProperty({
        description: 'The new quantity of the product',
        example: 2,
        minimum: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    quantity: number;
}
