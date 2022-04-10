import { Controller, Post, Body, Get, Param, Delete, Logger, NotFoundException, ValidationPipe, UsePipes, ParseIntPipe, HttpCode, HttpException, HttpStatus} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { AddCityDto } from "src/dto/AddCity.dto";
import { WeatherService } from "src/weather/weather.service";
import { CityService } from "./city.service";

@Controller('cities')
export class CityController{

    private readonly logger = new Logger(CityService.name);

    constructor(private readonly cityService: CityService, private readonly weatherService: WeatherService) {}

    // @Post()
    // async addCity(@Body('city') cityName: string): Promise<any> {
    //     const cityId = this.cityService.insertCity(cityName);
    //     await this.weatherService.insertWeatherData( await this.weatherService.getWeatherData(cityName) );
    //     return{id: cityId}            
    // }

    @Post()
    @UsePipes(ValidationPipe)
    async addCity(@Body() cityData: AddCityDto): Promise<any> {
           
        const existingCity = await this.cityService.checkIfExists(cityData.city);
        if(existingCity) {
            throw new HttpException({
                status: 409,
                error: "City already exists"}, HttpStatus.CONFLICT);
        }

        const cityId = await this.cityService.insertCity(cityData.city);
        await this.weatherService.insertWeatherData( await this.weatherService.getWeatherData(cityData.city) );
        
        return {message: 'City insered with id: ' + cityId};

    }

    @Get()
    async getAllcities() {
        const cities =  await this.cityService.getCities();
        const weatherData = await this.weatherService.getAllWeatherData();
        return {cities , weatherData};
    }


    @Get(':name/weather')
    async getCityWeather(@Param('name') cityName: string){
        let cityWeather;
        try {
            cityWeather =  await this.weatherService.getCityWeather(cityName);
            // return cityWeather;
        } catch (error) {
            if(error.name === 'NotFoundException') {
                try {
                    cityWeather = await this.weatherService.getWeatherData(cityName);
                }
                catch(error){
                    throw new HttpException({
                        status: 400,
                        error: "Invalid City"}, HttpStatus.BAD_REQUEST);
                };
            }
                
        }

        const GeoData = await this.cityService.getCityGeoData(cityName);
        const pastWeather = await this.weatherService.get5DaysHistoricWeatherData(GeoData.lat, GeoData.lon);

        // return { cityWeather, weeklyWeather };
        return { cityWeather, pastWeather };

    }

    @Get(':name/forecast')
    async getCityForecast(@Param('name') cityName: string){

        const GeoData = await this.cityService.getCityGeoData(cityName);
        if(!GeoData) {
            throw new HttpException({
                status: 400,
                error: "Invalid City"}, HttpStatus.BAD_REQUEST);
        }
        return await this.weatherService.getNextWeekWeatherData(GeoData.lat, GeoData.lon);
    }



    @Delete(':id')
    async removeCity(@Param('id') cityId: string){
        return await this.cityService.deleteCity(cityId);
    }
    

    @Get('weather')
    async getAllWeatherData(){
        const weatherData = await this.weatherService.getAllWeatherData();
        return weatherData;
    }




}

