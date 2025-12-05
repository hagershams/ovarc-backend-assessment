const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

const db = { sequelize, Sequelize };


// Import models
db.Store = require('./store')(sequelize, DataTypes);
db.Book = require('./book')(sequelize, DataTypes);
db.Author = require('./author')(sequelize, DataTypes);
db.StoreBook = require('./storeBook')(sequelize, DataTypes);

// Call associate if exists (this connects relations)
Object.keys(db).forEach((modelName) => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Associations
// db.Store.belongsToMany(db.Book, { through: db.StoreBook, foreignKey: 'store_id' });
// db.Book.belongsToMany(db.Store, { through: db.StoreBook, foreignKey: 'book_id' });

// db.Author.hasMany(db.Book, { foreignKey: 'author_id' });
// db.Book.belongsTo(db.Author, { foreignKey: 'author_id' });
// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) db[modelName].associate(db);
// });

module.exports = db;
