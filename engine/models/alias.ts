import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import User from "./user";

@Table
export default class Alias extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        primaryKey: true
    })
    zoneId!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true
    })
    userId!: number

    @BelongsTo(() => User, {
        foreignKey: 'userId',
    })
    user?: User;

    @Column(DataType.STRING)
    slackUserId?: string;

    @Column(DataType.STRING)
    name?: string;

    get hidden() {
        return !this.name;
    }

    get tag() {
        if (this.slackUserId) {
            return '<@' + this.slackUserId + '>';
        }
        return '<#' + this.userId + '>';
    }
};