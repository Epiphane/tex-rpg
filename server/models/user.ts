import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table
export default class User extends Model {
    // @Column({
    //     type: DataType.INTEGER,
    //     primaryKey: true,

    // })
    // id!: number;

    @Column({
        type: DataType.STRING,
        unique: true,
    })
    username?: string;

    @Column(DataType.STRING)
    displayName?: string;

    @Column(DataType.INTEGER)
    level: number = 1;
}