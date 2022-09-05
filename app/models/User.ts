import {
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Flight } from './Flight';
import { Trip } from './Trip';

@Table({ timestamps: true })
export class User extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.STRING)
  username: string;

  @Column(DataType.STRING)
  email: string;

  @Column(DataType.BOOLEAN)
  admin: boolean;

  @Column(DataType.STRING)
  firstName: string;

  @Column(DataType.STRING)
  lastName: string;

  @HasMany(() => Flight)
  flights: Flight[];

  @HasMany(() => Trip)
  trips: Trip[];
}
