import { Sequelize } from 'sequelize-typescript';
import {
  AircraftType,
  Airline,
  Airport,
  Country,
  Flight,
  Region,
  Trip,
  User,
} from '../models';

export const sequelize = new Sequelize({
  database: 'flightlogger_db',
  dialect: 'sqlite',
  storage: ':memory:',
  models: [AircraftType, Airline, Airport, Country, Flight, Region, Trip, User],
  logQueryParameters: true,
  benchmark: true,
});
