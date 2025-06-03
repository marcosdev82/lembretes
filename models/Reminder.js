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
    date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});

Reminder.belongsTo(User); 
User.hasMany(Reminder);  


module.exports = Reminder;
