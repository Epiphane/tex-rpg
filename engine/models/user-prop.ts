import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import User from "./user";

@Table
export default class UserProp extends Model {
    @Column({
        type: DataType.NUMBER,
        primaryKey: true,
    })
    userId!: number;

    @BelongsTo(() => User, 'userId')
    user?: User;

    @Column({
        type: DataType.STRING,
        primaryKey: true,
    })
    key!: string;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    value: any;
}
