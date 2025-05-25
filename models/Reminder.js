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
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

Reminder.belongsTo(User); 
User.hasMany(Reminder);  


module.exports = Reminder;
