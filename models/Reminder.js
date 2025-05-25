const { Datatype } = require('sequelize');

const db = require('../db/conn');

// User

const Reminder = db.define('Reminder', {
    title: {
        type: Datatype.STRING,
        allowNull: false,
    },
    description: {
        type: Datatype.TEXT,
        allowNull: false,
    },
    date: {
        type: Datatype.DATE,
        allowNull: false,
    },
});

module.exports = Reminder;