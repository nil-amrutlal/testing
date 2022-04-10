import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class AddCityDto {

    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    city: string


}

