import { BelongsTo, BelongsToMany, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { BelongsToManyGetAssociationsMixin } from "sequelize/types";
import FightAction from "./fight-action";
import Fighting from "./fighting";
import User from "./user";

@Table
export default class Fight extends Model {
    // @Column({
    //     type: DataType.INTEGER,
    //     primaryKey: true,
    //     allowNull: false,
    // })
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    zoneId!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    channelId!: string;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    length: number = 0;

    @BelongsToMany(() => User, () => Fighting, 'fightId', 'userId')
    users?: User[];
    Fighting?: Fighting;

    @BelongsTo(() => User, { foreignKey: 'winnerId' })
    winner?: User;

    @HasMany(() => FightAction, { foreignKey: 'fightId' })
    actions?: FightAction[];

    // Association methods
    getUsers!: BelongsToManyGetAssociationsMixin<User>;

    // Getters
    private _opponents?: User[];
    get opponents() {
        if (!this._opponents) {
            throw `Fight was acquired without opponents`;
        }
        return this._opponents;
    }

    set opponents(opponents: User[]) {
        this._opponents = opponents;
    }

    recordAction(user: User, description: string) {
        return this.increment('length')
            .then(fight => FightAction.create({
                fightId: fight.id,
                id: fight.length,
                userId: user.id,
                description,
            }))
    }
}