import { BadRequestException, ConsoleLogger, Injectable , Logger, NotAcceptableException, NotFoundException} from '@nestjs/common';
import { throws } from 'assert';
import { threadId } from 'worker_threads';
import { City } from './city.model'
import { Coordinates } from './city.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { count } from 'console';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';
import { Cron } from '@nestjs/schedule';
import { Weather } from 'src/weather/weather.model';


@Injectable()
export class CityService{
    
    private readonly logger = new Logger(CityService.name);
    private cities: City[] = [];

    constructor(
        @InjectModel('City') private cityModel: Model<City>, 
        @InjectModel('Weather') private weatherModel: Model<Weather>, 
        private httpService : HttpService) {}

    async insertCity(name: string) {
        const geoData = await this.getCityGeoData(name);
        if(geoData){
            const newCity = new this.cityModel({
                name,
                lat : geoData['lat'], 
                lon: geoData['lon'],    
            });
            const result = await newCity.save();
            return result._id;
        } else{
            throw new NotAcceptableException('Invalid City name: ' + name);
        }
    }

    async getCities(){
        const cities = await this.cityModel.find().exec();
        return cities.map((city) => ({
            id: city.id, 
            name: city.name
        }));
        // const listOfCities = await this.getListOfCities();
        // return await this.getListOfCities();
    }

    getCityWeather(id: string) {
        const cityData = this.cities.find(c => c.id === id);
        if(!cityData){
            throw new NotFoundException('Could not find city');
        }
        return{...cityData};
    }


    async deleteCity(id: string) {
        const cityData = await this.findCity(id);
        if(!cityData){throw new NotFoundException('Could not find city');}

        try {
            await this.cityModel.findByIdAndDelete(id);
            this.logger.debug(cityData.name);
            await this.weatherModel.findOneAndDelete({city: cityData.name});
            return {message: 'Deleted successfully'};
        } catch (error) {
            throw new NotAcceptableException('Could not delete')
        }
    }


    async findCity(id: string) {
        let cityData;
        try {
            const cityData = await this.cityModel.findById(id);
            return cityData;
        } catch (error) {
            throw new NotFoundException('Could not find data for the city');
        }            

        if (!cityData) {
            throw new NotFoundException('Could not find data for the city');
        }
    }


    async checkIfExists(name: string)  {
        return await this.cityModel.exists({name: name});
    }

    public async getCityGeoData(cityName: string) {
        let GeoData : Coordinates;
        const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${process.env.OpenWeatherApiKey}`;
 

        const {status, data} =  await this.httpService.get(url).toPromise();

        if(status === 200 && data.length > 0) {
            GeoData = {lat: data[0].lat, lon: data[0].lon }
            return GeoData;
        } else {
            return null;
        }
    }


    // public async getListOfCities(){
    //     const cities = await this.cityModel.find().exec();
    //     return cities.map((city) => ({
    //         id: city.id, 
    //         name: city.name
    //     }));
    // }


    



    // private async getCityGeoData(cityName: string) {

    //     const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${process.env.OpenWeatherApiKey}`;

    //     return this.httpService
    //     .get(url)
    //     .pipe(
    //         map (res => res.data)) 
    // }



}