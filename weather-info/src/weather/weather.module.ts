import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose' ;
import { CityModule } from "src/city/city.module";

import { WeatherController } from "./weather.controller";
import { WeatherSchema } from "./weather.model";
import { WeatherService } from "./weather.service";
import { CityService } from "src/city/city.service";
import { CitySchema } from "src/city/city.model";



@Module({
    imports: [
        MongooseModule.forFeature([{name: 'City', schema: CitySchema}]),
        MongooseModule.forFeature([{name: 'Weather', schema: WeatherSchema}]),
        HttpModule,
    ],
    controllers: [WeatherController],
    providers: [WeatherService, CityService],
})

export class WeatherModule {}