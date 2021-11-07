import { BeforeValidate, Column, DataType, Model } from "sequelize-typescript";
import { Origin, Origins } from "./origins";

export class ModelWithRandomId extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    id!: number;

    @BeforeValidate
    static beforeValidateHook(instance: ModelWithRandomId) {
        if (instance.getDataValue('id') == null) {
            instance.setDataValue('id', Math.floor(Math.random() * 99999999));
        }
    }
}

export class ModelWithIdAndOrigin extends ModelWithRandomId {
    @Column({
        type: DataType.STRING,
        field: 'origin',
        get: function () {
            const name = this.getDataValue('origin') as string;
            return Origins[name];
        },
        set: function (val?: Origin) {
            this.setDataValue('origin', val ? val.name : null);
        }
    })
    origin?: Origin;
}