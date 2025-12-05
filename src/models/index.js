const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Store = require('./store')(sequelize, Sequelize);
db.Book = require('./book')(sequelize, Sequelize);
db.Author = require('./author')(sequelize, Sequelize);
db.StoreBook = require('./storeBook')(sequelize, Sequelize);

// Associations
db.Store.belongsToMany(db.Book, { through: db.StoreBook, foreignKey: 'store_id' });
db.Book.belongsToMany(db.Store, { through: db.StoreBook, foreignKey: 'book_id' });

db.Author.hasMany(db.Book, { foreignKey: 'author_id' });
db.Book.belongsTo(db.Author, { foreignKey: 'author_id' });

module.exports = db;
