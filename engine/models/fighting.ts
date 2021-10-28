import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import Fight from "./fight";
import FightAction from "./fight-action";
import User from "./user";

export enum FightProgress {
    InProgress = 'InProgress',
    Complete = 'Complete',
}

@Table
export default class Fighting extends Model {
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
    userId!: string;

    @BelongsTo(() => Fight, 'fightId')
    fight?: Fight;

    @BelongsTo(() => User, 'userId')
    user?: User;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: FightProgress.InProgress,
    })
    status: FightProgress = FightProgress.InProgress;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 100
    })
    health: number = 100;
}