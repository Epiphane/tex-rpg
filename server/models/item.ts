import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table
export default class Item extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false,
    })
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name?: string;

    @Column(DataType.JSON)
    stats: object = {};

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    type: string = '';
}