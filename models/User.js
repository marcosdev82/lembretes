const { DataTypes } = require('sequelize');  
const db = require('../db/conn');

const User = db.define('User', {
  // -------------------------
  // Informações básicas / perfil
  // -------------------------
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true, 
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
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL ou caminho do avatar do usuário',
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição curta do usuário',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Telefone de contato do usuário',
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: true,
  },

  // -------------------------
  // Controle e status
  // -------------------------
  status: {
    type: DataTypes.ENUM('Administrator', 'Author', 'Editor', 'Subscriber', 'Inactive'),
    allowNull: true,
    defaultValue: 'Subscriber',
    comment: 'Define as regras de acesso do usuário ao sistema',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica se o e-mail do usuário foi verificado',
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Última vez que o usuário fez login',
  },

  // -------------------------
  // Recuperação de senha
  // -------------------------
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // -------------------------
  // Configurações / preferências
  // -------------------------
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Configurações personalizadas do usuário',
  },

  // -------------------------
  // Segurança
  // -------------------------
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  paranoid: true, // habilita soft delete (deletedAt)
  timestamps: true, // createdAt e updatedAt automáticos
});

module.exports = User;
