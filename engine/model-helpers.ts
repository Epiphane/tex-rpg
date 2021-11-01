import { BeforeValidate, Column, DataType, Model } from "sequelize-typescript";

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