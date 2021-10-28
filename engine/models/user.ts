import { Column, DataType, Model, PrimaryKey, Table, BeforeBulkCreate, BeforeCreate, BeforeUpdate } from "sequelize-typescript";
import * as crypto from 'crypto';
import Alias from "./alias";

export interface UserInfo {
    id: number;
    zoneId: string;
    tag: string;
    name?: string;
    level: number;
}

@Table
export default class User extends Model {
    // @Column({
    //     type: DataType.INTEGER,
    //     primaryKey: true,

    // })
    id!: number;

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
        allowNull: false
    })
    password!: string;

    @Column(DataType.STRING)
    salt?: string;

    @Column(DataType.INTEGER)
    level: number = 1;

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

    @BeforeBulkCreate
    static beforeBulkCreateHook(users: User[], options: any) {
        return Promise.all(
            users.map(user =>
                user.updatePassword()
            )
        );
    };

    @BeforeCreate
    static beforeCreateHook(user: User, options: any) {
        return user.updatePassword();
    };

    @BeforeUpdate
    static beforeUpdateHook(user: User, options: any) {
        if (user.changed('password')) {
            return user.updatePassword();
        }
    }

    /*
    say(message, type) {
        if (Array.isArray(message) || typeof (message) === 'string') {
            message = {
                type: type,
                md_text: message
            };
        }

        return {
            user_id: this._id,
            attachments: [message]
        };
    };
    */

    authenticate(password: string) {
        return this.password === this.encryptPassword(password);
    };

    makeSalt(byteSize: number = 16) {
        return crypto.randomBytes(byteSize).toString('base64');
    };

    encryptPassword(password: string) {
        this.salt = this.salt ?? this.makeSalt();

        return crypto.pbkdf2Sync(
            password,
            this.salt,
            10000,
            64,
            'sha512',
        ).toString('base64');
    };

    updatePassword() {
        // Handle new/update passwords
        if (this.password) {
            this.salt = this.makeSalt();
            this.password = this.encryptPassword(this.password);
        }
    };
}