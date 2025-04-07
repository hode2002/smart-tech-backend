import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeVariantDto {
    @ApiProperty({
        description: 'The ID of the new product variant',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    @IsNotEmpty()
    newVariantId: string;

    @ApiProperty({
        description: 'The ID of the old product variant to replace',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    @IsString()
    @IsNotEmpty()
    oldVariantId: string;
}
