module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    pages: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    author_id: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'books', timestamps: false }, {
    tableName: 'books',
    timestamps: false,
    indexes: [{ fields: ['name', 'author_id'] }],
  });

  Book.associate = (models) => {
  Book.belongsTo(models.Author, { foreignKey: 'author_id', as: 'Author' });
  Book.belongsToMany(models.Store, { through: models.StoreBook, foreignKey: 'book_id', as: 'Stores' });
  };

  return Book;
};
