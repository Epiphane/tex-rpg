import { Place } from "./place";
import { glob } from 'glob';
import path = require("path");

export const Places: { [key: string]: Place } = {};

glob.sync(`${__dirname}/place/*`)
    .filter(filename => {
        const extension = path.extname(filename);
        return filename !== __filename.replace(/\\/g, '/') &&
            (extension === '.ts' || extension === '.js');
    })
    .map(filename => {
        const parsedFile = path.parse(filename);
        return path.join(parsedFile.dir, parsedFile.name);
    })
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .map(fullPath => {
        const module = require(fullPath);
        for (const key in module) {
            if (module[key] instanceof Place) {
                Places[module[key].id] = module[key];
            }
            else if (module[key] instanceof Place.constructor) {
                Places[module[key].id] = new module[key]();
            }
            else {
                console.log();
                console.log(key);
                console.log(module[key]);
                console.log(module[key] instanceof Place.constructor);
                console.log(module[key] instanceof Place.constructor);
            }
        }
    });

export class World {
    static GetPlace(name: string): Place {
        if (!Places[name]) {
            throw `Place ${name} does not exist`;
        }

        return Places[name];
    }
}
