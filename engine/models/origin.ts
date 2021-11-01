import { Column, Model, Table } from "sequelize-typescript";

@Table
export default class Origin extends Model {
    @Column({
        allowNull: false
    })
    name!: string;

    @Column({
        allowNull: false
    })
    descriptor!: string;
}