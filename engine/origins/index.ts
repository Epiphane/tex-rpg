import { Column, DataType } from "sequelize-typescript";

export class Origin {
    constructor(
        public name: string,
        public adjective: string,
    ) {

    }
}

export const Origins = {
    Alliance: new Origin('Alliance', 'Allied'),
    Chaos: new Origin('Chaos', 'Chaotic'),
    Elderryn: new Origin('Elderryn', 'Elderryn'),
    Genotia: new Origin('Genotia', 'Genotic'),
    Wastelands: new Origin('Wastelands', 'Wastelandic'),
} as {
    [key: string]: Origin
};

export class HasOrigin {
    @Column({
        type: DataType.STRING,
        field: 'origin',
        get: function () {
            const name = this.getDataValue('origin') as string;
            const origin = Origins[name];
            if (!origin) {
                throw `Invalid origin ${name}`;
            }
            return origin;
        },
        set: function (val: Origin) {
            this.setDataValue('origin', val.name);
        }
    })
    origin: Origin = Origins.Chaos;
}
