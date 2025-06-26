const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    // port: config.DB_PORT,
    port: config.DB_PORT,
    dialect: 'mysql',
  }
);

module.exports = sequelize;
