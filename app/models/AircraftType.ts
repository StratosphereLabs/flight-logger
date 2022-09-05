import {
  AllowNull,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

@Table
export class AircraftType extends Model<AircraftType> {
  @AllowNull(false)
  @Column(DataType.STRING)
  iata: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  icao: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;
}
