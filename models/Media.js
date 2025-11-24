const { DataTypes } = require('sequelize');
const db = require('../db/conn');

const Media = db.define('Media', {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    media_title: DataTypes.STRING,
    meida_mime_type: DataTypes.STRING,
    guid: DataTypes.STRING,
    media_parent: {
      type: DataTypes.BIGINT.UNSIGNED,
      defaultValue: null
    }
  }, {
    tableName: "media",
    timestamps: true,
    createdAt: "media_date",
    updatedAt: "media_modified"
});

module.exports = Media;
