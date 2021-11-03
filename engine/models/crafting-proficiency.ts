import { Table, Model, BelongsTo, Column } from "sequelize-typescript";
import User from "./user";

@Table
export default class CraftingProficiency extends Model {
    @BelongsTo(() => User, 'userId')
    user?: User;

    @Column({
        primaryKey: true,
    })
    name: string = '';

    @Column
    level: number = 0;
}