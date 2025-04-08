import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FeeDataDto {
    @IsString()
    @IsNotEmpty()
    pickProvince: string;

    @IsString()
    @IsNotEmpty()
    pickDistrict: string;

    @IsString()
    @IsNotEmpty()
    province: string;

    @IsString()
    @IsNotEmpty()
    district: string;

    @IsString()
    @IsNotEmpty()
    ward: string;

    @IsNumber()
    @IsNotEmpty()
    weight: number;
}
