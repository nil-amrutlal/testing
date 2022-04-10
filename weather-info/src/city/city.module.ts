import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose' ;
import { WeatherSchema } from "src/weather/weather.model";
import { WeatherService } from "src/weather/weather.service";

import { CityController } from "./city.controller";
import { CitySchema } from "./city.model";
import { CityService } from "./city.service";
// import { WeatherService } from "../weather/weather.service";
// import { WeatherSchema } from "../weather/weather.model";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'City', schema: CitySchema}]),
        MongooseModule.forFeature([{name: 'Weather', schema: WeatherSchema}]),
        HttpModule,
    ],
    controllers: [CityController],
    providers: [CityService, WeatherService],
})

export class CityModule {}