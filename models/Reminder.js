const { DataTypes } = require('sequelize');
const db = require('../db/conn');

const User = require('./User');
const { ca } = require('date-fns/locale');

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
        type: DataTypes.ENUM('draft', 'published', 'pending', 'trashed', 'private'),
        allowNull: false,
        defaultValue: 'draft'
    },
    author: {
        type: DataTypes.INTEGER,
        allowNull: false,
    } 
});

Reminder.belongsTo(User); 
User.hasMany(Reminder);  

module.exports = Reminder;