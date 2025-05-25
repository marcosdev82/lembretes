const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('lembretes', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

try {
    sequelize.authenticate()
    console.log('Conectado com sucesso!')
} catch (error) {
    console.error('Erro ao conectar:', error)
}

module.exports = sequelize