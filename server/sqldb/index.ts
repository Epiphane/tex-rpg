import { Sequelize } from 'sequelize-typescript';
import environment from '../environment';
import Item from '../../engine/models/item';
import User from '../../engine/models/user';
import Alias from '../../engine/models/alias';
import Fighting from '../../engine/models/fighting';
import Fight from '../../engine/models/fight';
import FightAction from '../../engine/models/fight-action';

const { sequelize: options } = environment;
const sequelize = options.uri
    ? new Sequelize(options.uri, options)
    : new Sequelize(options.database!, options.username!, options.password, options);

sequelize.addModels([__dirname + '/../../engine/models']);

export { Sequelize, sequelize };