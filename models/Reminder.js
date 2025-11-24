const { DataTypes } = require('sequelize');
const slugify = require('slugify');
const db = require('../db/conn');
const User = require('./User');

const Reminder = db.define('Reminder', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
    type: DataTypes.ENUM('draft', 'published', 'pending', 'expired', 'scheduled'),
    allowNull: true,
    defaultValue: 'draft',
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  author: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  paranoid: true,             // habilita soft delete
  deletedAt: 'deletedAt',     // define o campo usado para marcação de exclusão
  timestamps: true,           // createdAt e updatedAt
  tableName: 'Reminders',     // nome da tabela explicitamente
  hooks: {
    beforeValidate: (reminder) => {
      if (reminder.title && !reminder.slug) {
        reminder.slug = slugify(reminder.title, {
          lower: true,
          strict: true,
        });
      }
    },
  },
});

// Relacionamentos
Reminder.belongsTo(User, { foreignKey: 'author' });
User.hasMany(Reminder, { foreignKey: 'author' });

module.exports = Reminder;
