import { Injectable, Logger, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { InjectModel } from "@nestjs/mongoose";
import { City } from "src/city/city.model";
import { PastWeather, Weather, WeeklyWeather } from "./weather.model";
import { Model } from 'mongoose';
import { map } from "rxjs";
import moment from "moment";

@Injectable()
export class WeatherService{
    
    private readonly logger = new Logger(WeatherService.name);

    constructor(
        @InjectModel('City') private cityModel: Model<City>, 
        @InjectModel('Weather') private weatherModel: Model<Weather>, 
        private httpService : HttpService) {}


    async getWeatherData(city: string){
        let weatherData : Weather;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OpenWeatherApiKey}&units=metric`

        const {status, data} = await this.httpService.get(url).toPromise();
        this.logger.debug("HTTP Get Weather - status code " + status)
        if(status === 200){
             weatherData = {
                 city: data.name,
                 main: data.weather[0].main,
                 temp: data.main.temp,
                 feels_like: data.main.feels_like,
                 temp_min: data.main.temp_min,
                 temp_max: data.main.temp_max,
                 pressure: data.main.pressure,
                 humidity: data.main.humidity,
             }
        } 

        return weatherData;
    }


    async insertWeatherData(weatherData: Weather) {
        const newWeather = new this.weatherModel({
            city: weatherData.city,
            main: weatherData.main,
            temp: weatherData.temp,
            feels_like: weatherData.feels_like,
            temp_min: weatherData.temp_min,
            temp_max: weatherData.temp_max,
            pressure: weatherData.pressure,
            humidity: weatherData.humidity,

        })

        const result = await newWeather.save();
    }


    async getCityWeather(city: string) {
        let weatherData;

        try {
            const weatherData = await this.weatherModel.findOne({city: city});
            return {
                city: weatherData.city, 
                main: weatherData.main, 
                temp: weatherData.temp,
                feels_like: weatherData.feels_like,
                temp_min: weatherData.temp_min,
                temp_max: weatherData.temp_max,
                pressure: weatherData.pressure,
                humidity: weatherData.humidity,
            };
        } catch (error) {
            console.log('Entrei');
            throw new NotFoundException('Could not find data for the city');
        }            

        if (!weatherData) {
            throw new NotFoundException('Could not find data for the city');
        }
    }

    async getAllWeatherData() {
        const listWeatherData = await this.weatherModel.find().exec();
        return listWeatherData.map((weatherData) => ({
            city: weatherData.city, 
            main: weatherData.main, 
            temp: weatherData.temp,
            feels_like: weatherData.feels_like,
            temp_min: weatherData.temp_min,
            temp_max: weatherData.temp_max,
            pressure: weatherData.pressure,
            humidity: weatherData.humidity,
        }));
    }

    async deleteAllData(){
        this.logger.debug("Deleting Weather Data");
        await this.weatherModel.deleteMany({});
    }
    
    async getNextWeekWeatherData(lat :number, lon:number) : Promise<WeeklyWeather[]> {
        let weatherDataArray : WeeklyWeather[] = [];
        let weatherData: WeeklyWeather;
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${process.env.OpenWeatherApiKey}&units=metric`
        
        try {
            const {status, data} = await this.httpService.get(url).toPromise();
            this.logger.debug("HTTP Get Weather Forecast - status code " + status)
            if(status === 200){
                data.daily.forEach(element => {
                    weatherData = {
                        date: new Date(element.dt * 1000).toLocaleDateString(),
                        main: element.weather[0].main,
                        temp_day: element.temp.day,
                        temp_night: element.temp.night,
                        feels_like_day: element.feels_like.day,
                        feels_like_night: element.feels_like.night,
                        pressure: element.pressure,
                        humidity: element.himify,
                        windSpeed: element.wind_speed,
                    }

                    weatherDataArray.push(weatherData);
                });
            }

        return weatherDataArray;
            
        } catch (error) {
            throw new NotAcceptableException('Invalid city');
        }
    } 

    async get5DaysHistoricWeatherData(lat :number, lon:number) : Promise<PastWeather[]> {
        let weatherDataArray : PastWeather[] = [];
        let weatherData: PastWeather;
        let currentTimeInSeconds=Math.floor(Date.now()/1000) - 3600;
        let dayInSeconds = 86400;
        let counter = 0;

        while( counter < 5){
            
            var dt = currentTimeInSeconds - (counter * dayInSeconds);

            var url = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&appid=${process.env.OpenWeatherApiKey}&units=metric`

            try {
                const {status, data} = await this.httpService.get(url).toPromise();
                this.logger.debug("HTTP Get Historic Weather - status code " + status)
    
                if(status === 200){
                    weatherData = {
                        date: new Date(data.current.dt * 1e3).toISOString(),
                        main: data.current.weather[0].main,
                        temp: data.current.temp,
                        pressure: data.current.pressure,
                        humidity: data.current.humidity,
                        windSpeed: data.current.wind_speed
                    }

                    weatherDataArray.push(weatherData);
                }
            
            counter = counter + 1;
                
            } catch (error) {
                throw new NotAcceptableException('Invalid city');
            }
        }

        return weatherDataArray;

    }


}