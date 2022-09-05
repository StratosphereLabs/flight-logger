import {
  AllowNull,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Region } from './Region';

@Table
export class Country extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  continent: string;

  @HasMany(() => Region)
  regions: Region[];

  @Column(DataType.STRING)
  wiki: string;
}
