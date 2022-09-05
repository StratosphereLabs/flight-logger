import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Flight } from './Flight';
import { User } from './User';

@Table({ timestamps: true })
export class Trip extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.STRING)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @HasMany(() => Flight)
  flights: Flight[];
}
