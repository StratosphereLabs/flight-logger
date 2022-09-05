import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Country } from './Country';
import { Region } from './Region';

@Table
export class Airport extends Model {
  @AllowNull(false)
  @Column(DataType.STRING)
  type: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.DOUBLE)
  lat: number;

  @AllowNull(false)
  @Column(DataType.DOUBLE)
  lon: number;

  @Column(DataType.INTEGER)
  elevation: number;

  @Column(DataType.STRING)
  continent: string;

  @ForeignKey(() => Country)
  @Column(DataType.STRING)
  countryId: string;

  @BelongsTo(() => Country)
  country: Country;

  @ForeignKey(() => Region)
  @Column(DataType.STRING)
  regionId: string;

  @BelongsTo(() => Region)
  region: Region;

  @Column(DataType.STRING)
  municipality: string;

  @Column(DataType.STRING)
  timeZone: string;

  @Column(DataType.BOOLEAN)
  scheduledService: boolean;

  @AllowNull(false)
  @Column(DataType.STRING)
  ident: string;

  @Column(DataType.STRING)
  gps: string;

  @Column(DataType.STRING)
  iata: string;

  @Column(DataType.STRING)
  icao: string;
}
