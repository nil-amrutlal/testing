import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule';


import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CityModule } from './city/city.module';
import { WeatherModule } from './weather/weather.module';


// import environment variables
const dotenv = require("dotenv");
dotenv.config();



@Module({
  imports: [
    CityModule, 
    MongooseModule.forRoot(`mongodb+srv://${process.env.dbUser}:${process.env.dbPassword}@cluster0.a8xvs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`),
    WeatherModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
 