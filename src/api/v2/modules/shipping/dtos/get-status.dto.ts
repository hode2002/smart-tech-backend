import { IsNotEmpty, IsString } from 'class-validator';

export class GetStatusDto {
    @IsString()
    @IsNotEmpty()
    trackingCode: string;
}
