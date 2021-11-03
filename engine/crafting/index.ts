import { glob } from 'glob';
import path = require('path');
import { CraftingPhase } from './phase';

const modules: { [key: string]: typeof CraftingPhase } = {};

glob.sync(`${__dirname}/*`)
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
        if (module.default) {
            const name = module.default.name;
            modules[name] = module.default;
        }
    });

export default modules;