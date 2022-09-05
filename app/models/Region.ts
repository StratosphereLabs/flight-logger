import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Country } from './Country';

@Table
export class Region extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @ForeignKey(() => Country)
  @Column(DataType.STRING)
  countryId: string;

  @BelongsTo(() => Country)
  country: Country;

  @Column(DataType.STRING)
  continent: string;

  @Column(DataType.STRING)
  wiki: string;
}
