const { DataTypes } = require('sequelize');  
const db = require('../db/conn');

const User = db.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Administrator', 'Author', 'Editor', 'Subscriber', 'Inactive'),
    allowNull: true,
    defaultValue: 'Subscriber',
    comment: 'Define as regras de acesso do usuário ao sistema',
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true, 
    comment: 'URL ou caminho do avatar do usuário',
  },
});

module.exports = User;
