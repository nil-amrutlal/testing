import * as mongoose from 'mongoose';


export const CitySchema = new mongoose.Schema({
    name: {type: String, required: true},
    lat: {type: Number, required: true}, 
    lon: {type: Number, required: true}
})



export interface City {
    id: string;
    name: string;
    lat: number;
    lon: number;
}


export interface Coordinates{
    lat: number;
    lon: number;
}
