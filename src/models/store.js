module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false , defaultValue: ''},
  }, { tableName: 'stores', timestamps: false ,    indexes: [{ fields: ['name', 'address'] }],});

  Store.associate = (models) => {
    Store.belongsToMany(models.Book, { through: models.StoreBook, foreignKey: 'store_id', as: 'Books' });
  };
  return Store;
};
