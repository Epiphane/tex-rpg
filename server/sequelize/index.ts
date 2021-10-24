import { Sequelize } from 'sequelize-typescript';
import environment from '../environment';
import Item from '../models/item';
import User from '../models/user';

const { sequelize: options } = environment;
const sequelize = options.uri
  ? new Sequelize(options.uri, options)
  : new Sequelize(options.database!, options.username!, options.password, options);

sequelize.addModels([__dirname + '/../models']);

Item.belongsTo(User);

export { Sequelize, sequelize };