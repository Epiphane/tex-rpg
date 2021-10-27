import { Secret } from "jsonwebtoken";
import path = require("path/posix");
import { SequelizeOptions } from "sequelize-typescript";

enum EnvironmentName {
    Test = 'test',
    Dev = 'development',
    Prod = 'production',
};

export interface Environment {
    name: EnvironmentName;
    root: string;
    seedDB: boolean;
    allowCaching: boolean;
    sequelize: SequelizeOptions & { uri: string };
    jwtSecret: Secret;
}

const name = (process.env.NODE_ENV ?? 'test') as EnvironmentName;
if (!Object.values(EnvironmentName).includes(name)) {
    throw `Invalid environment: ${name}. Valid options are: ${Object.values(EnvironmentName).join(' ')}`;
}

const overrides = require(`./${name}`).default;
const environment: Environment = {
    name,
    root: path.normalize(path.join(__dirname, '../../../')),
    seedDB: false,
    allowCaching: true,

    ...overrides,
}

export default environment;