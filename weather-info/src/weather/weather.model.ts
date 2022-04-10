import * as mongoose from 'mongoose';


export const WeatherSchema = new mongoose.Schema({
    city: {type: String, required: true},
    main: {type: String, required: true},
    temp: {type: String, required: true},
    feels_like: {type: Number, required: true}, 
    temp_min: {type: Number},
    temp_max: {type: Number},
    pressure: {type: Number},
    humidity: {type: Number},
})


export interface Weather {
    city: string,
    main: string,
    temp: number,
    feels_like: number,
    temp_min: number,
    temp_max: number,
    pressure: number,
    humidity: number,
}


export interface WeeklyWeather {
    date: string,
    main: string
    temp_day: string,
    temp_night: string,
    feels_like_day: number,
    feels_like_night: number,
    pressure: number,
    humidity: number,
    windSpeed: number;
}


export interface PastWeather {
    date: string,
    main: string,
    temp: string,
    pressure: number,
    humidity: number,
    windSpeed: number;
}