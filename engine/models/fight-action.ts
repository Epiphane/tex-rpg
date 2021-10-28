import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import User from "./user";

@Table
export default class FightAction extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false,
    })
    fightId!: number;

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false,
    })
    id!: number;

    @BelongsTo(() => User, 'userId')
    user?: User;

    @Column(DataType.STRING)
    description?: string;
}