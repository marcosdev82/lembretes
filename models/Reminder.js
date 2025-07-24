const { DataTypes } = require('sequelize');
const db = require('../db/conn');
const User = require('./User');

const Reminder = db.define('Reminder', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    post_content: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    post_expire: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    post_status: {
        type: DataTypes.ENUM('draft', 'published', 'pending', 'expired'),
        allowNull: true,
        defaultValue: 'draft'
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    author: {
        type: DataTypes.INTEGER,
        allowNull: false,
    } 
}, {
    paranoid: true,             // Habilita soft delete
    deletedAt: 'deletedAt',     // Define o campo usado para marcação de exclusão
    timestamps: true,           // Garante o uso de createdAt e updatedAt
    tableName: 'Reminders'      // (opcional) define o nome da tabela explicitamente
});

Reminder.belongsTo(User); 
User.hasMany(Reminder);  

module.exports = Reminder;