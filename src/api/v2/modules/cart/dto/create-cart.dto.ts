import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCartDto {
    @ApiProperty({
        description: 'The ID of the product variant to add to cart',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    @IsNotEmpty()
    variantId: string;

    @ApiProperty({
        description: 'The quantity of the product to add',
        example: 1,
        minimum: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    quantity: number;
}
