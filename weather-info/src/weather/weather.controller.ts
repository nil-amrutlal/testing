import { Controller, Post, Body, Get, Param, Delete, Logger} from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { CityService } from "src/city/city.service";
import { WeatherService } from "src/weather/weather.service";



@Controller()
export class WeatherController{

    constructor(private readonly cityService: CityService, private readonly weatherService: WeatherService, private schedulerRegistry: SchedulerRegistry) {}

    private readonly logger = new Logger(WeatherService.name);

    onModuleInit() {
        const job = new CronJob(process.env.CRON_VALUE, async () => {
            this.logger.debug("Cron weather extraction job iniciated");

            const listCities = await this.cityService.getCities();
              
            try {
                this.weatherService.deleteAllData();
                listCities.map(async city => {
                    const weatherInfo = await this.weatherService.getWeatherData(city.name);
                    this.weatherService.insertWeatherData(weatherInfo);
            })
            } catch (error) {
                throw new Error(error);
            }
        });
      
        this.schedulerRegistry.addCronJob('getWeatherJob', job);
        this.logger.debug(`Cron Job Schedulled with following cron ${process.env.CRON_VALUE}`)
        job.start();
      }

    
    // @Cron('0 */42 * * * *')
    // async getWeatherData() {
    // this.logger.debug("Cron weather extraction job iniciated");

    // const listCities = await this.cityService.getCities();
      
    // try {
    //     this.weatherService.deleteAllData();
    //     listCities.map(async city => {
    //         const weatherInfo = await this.weatherService.getWeatherData(city.name);
    //         this.weatherService.insertWeatherData(weatherInfo);
    // })
    // } catch (error) {
    //     throw new Error(error);
    // }
  
    // }
}

