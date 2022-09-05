import {
  AllowNull,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

@Table
export class Airline extends Model {
  @AllowNull(false)
  @Column(DataType.STRING)
  iata: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  icao: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  callsign: string;

  @Column(DataType.INTEGER)
  fleetSize: number;

  @Column(DataType.INTEGER)
  destinations: number;

  @Column(DataType.STRING)
  logo: string;

  @Column(DataType.STRING)
  wiki: string;
}

export default Airline;
