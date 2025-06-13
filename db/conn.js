const { Sequelize } = require('sequelize');
const config = require('../config'); // Importando a configuração

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: 'mysql',
});

const authenticateDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conectado com sucesso! 🚀');
    } catch (error) {
        console.error('Erro ao conectar:', error + '❌');
    }
};

authenticateDB();

module.exports = sequelize;