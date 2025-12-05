module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define('Author', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
  }, { tableName: 'authors', timestamps: false});

  Author.associate = (models) => {
  Author.hasMany(models.Book, { foreignKey: 'author_id', as: 'books' });
  };
  return Author;
};
