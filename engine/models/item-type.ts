import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table
export default class ItemType extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;
}