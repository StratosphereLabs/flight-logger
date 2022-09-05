import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { AircraftType } from './AircraftType';
import { Airline } from './Airline';
import { Airport } from './Airport';
import { Trip } from './Trip';
import { User } from './User';

@Table({ timestamps: true })
export class Flight extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.STRING)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Trip)
  @Column(DataType.STRING)
  tripId: string;

  @BelongsTo(() => Trip)
  trip: Trip;

  @ForeignKey(() => Airport)
  @Column(DataType.STRING)
  departureAirportId: string;

  @BelongsTo(() => Airport)
  departureAirport: Airport;

  @ForeignKey(() => Airport)
  @Column(DataType.STRING)
  arrivalAirportId: string;

  @BelongsTo(() => Airport)
  arrivalAirport: Airport;

  @ForeignKey(() => Airline)
  @Column(DataType.STRING)
  airlineId: string;

  @BelongsTo(() => Airline)
  airline: Airline;

  @ForeignKey(() => Airline)
  @Column(DataType.STRING)
  operatorAirlineId: string;

  @BelongsTo(() => Airline)
  operatorAirline: Airline;

  @Column(DataType.INTEGER)
  flightNumber: number;

  @Column(DataType.STRING)
  callsign: string;

  @ForeignKey(() => AircraftType)
  @Column(DataType.STRING)
  aircraftTypeId: string;

  @BelongsTo(() => AircraftType)
  aircraftType: AircraftType;

  @Column(DataType.STRING)
  tailNumber: string;

  @Column(DataType.DATE)
  outTime: Date;

  @Column(DataType.DATE)
  offTime: Date;

  @Column(DataType.DATE)
  onTime: Date;

  @Column(DataType.DATE)
  inTime: Date;

  @Column(DataType.STRING)
  class: string;

  @Column(DataType.STRING)
  seatNumber: string;

  @Column(DataType.STRING)
  seatPosition: string;

  @Column(DataType.STRING)
  reason: string;

  @Column(DataType.STRING)
  comments: string;

  @Column(DataType.STRING)
  trackingLink: string;
}
