import {
    Column,
    DataType,
    Table,
    BeforeBulkCreate,
    BeforeCreate,
    BeforeUpdate,
    BelongsTo,
    HasMany,
    BelongsToMany
} from "sequelize-typescript";
import {
    BelongsToManyGetAssociationsMixin,
    HasManyCreateAssociationMixin,
} from "sequelize/types";
import * as crypto from 'crypto';
import Alias from "./alias";
import Item from "./item";
import Fight from "./fight";
import Fighting from "./fighting";
import Crafting from "./crafting";
import { ModelWithIdAndOrigin } from "../model-helpers";
import ItemTypeProficiency from "./item-type-proficiency";
import ItemType from "./item-type";
import { solar } from "../world/place/solar";
import { Place } from "../world/place";
import { World } from "../world/world";
import UserProp from "./user-prop";

export interface UserInfo {
    id: number;
    zoneId: string;
    tag: string;
    name?: string;
    level: number;
}

@Table
export default class User extends ModelWithIdAndOrigin {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        get(this: User) {
            return null;
        },
        set(this: User, value: string) {
            this.setDataValue('salt', this.makeSalt());
            this.setDataValue('password', this.encryptPassword(value));
        },
    })
    private password!: string;

    @Column(DataType.STRING)
    private readonly salt!: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    AI: boolean = false;

    @HasMany(() => UserProp, 'userId')
    props?: UserProp[];

    @HasMany(() => Alias, 'userId')
    aliases?: Alias[];

    @Column(DataType.INTEGER)
    level: number = 1;

    @BelongsTo(() => Item, 'weaponId')
    weapon?: Item;

    @BelongsTo(() => Item, 'armorId')
    armor?: Item;

    @HasMany(() => Item, {
        foreignKey: 'userId',
        constraints: false
    })
    items?: Item[];

    @Column({
        type: DataType.STRING,
        get(this: User) {
            return World.GetPlace(this.getDataValue('location'));
        },
        set(this: User, place: Place) {
            this.setDataValue('location', place.id);
        },
    })
    location: Place = solar;

    @BelongsToMany(() => ItemType, () => ItemTypeProficiency, 'userId', 'itemTypeId')
    itemTypeProficiencies?: ItemType[];

    @HasMany(() => Crafting, 'userId')
    crafting?: Crafting[];

    @BelongsToMany(() => Fight, () => Fighting, 'userId', 'fightId')
    fights?: Fight[];
    Fighting?: Fighting;

    // Association methods
    getFights!: BelongsToManyGetAssociationsMixin<Fight>;

    // Arbitrary properties
    @Column
    p_solarHasSeenInscription: boolean = false;

    // Getters
    get tag() {
        return this.alias.tag;
    }

    private _alias?: Alias;
    get alias() {
        if (!this._alias) {
            throw `User was acquired without an alias`;
        }
        return this._alias;
    }

    set alias(alias: Alias) {
        this._alias = alias;
    }

    format(): UserInfo {
        return {
            id: this.id,
            zoneId: this.alias.zoneId,
            tag: this.tag,
            name: this.alias.name,
            level: this.level,
        };
    };

    authenticate(password: string) {
        return !this.AI && this.getDataValue('password') === this.encryptPassword(password);
    };

    makeSalt(byteSize: number = 16) {
        return crypto.randomBytes(byteSize).toString('base64');
    };

    encryptPassword(password: string) {
        return crypto.pbkdf2Sync(
            password,
            this.salt,
            10000,
            64,
            'sha512',
        ).toString('base64');
    };
}
