module.exports = (sequelize, DataTypes) => {
  const StoreBook = sequelize.define('StoreBook', {
    store_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    book_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    price: { type: DataTypes.FLOAT, allowNull: false },
    copies: { type: DataTypes.INTEGER, defaultValue: 0 },
    sold_out: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { tableName: 'store_books', timestamps: false });

  return StoreBook;
};
