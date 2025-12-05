const fs = require('fs');
const csv = require('csv-parser');
const db = require('../models');

async function uploadInventory(req, res) {
  if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      try {
        for (const row of results) {
          // 1. Upsert Author
          let [author] = await db.Author.findOrCreate({
            where: { name: row.author_name },
          });

          // 2. Upsert Book
          let [book] = await db.Book.findOrCreate({
            where: { name: row.book_name, author_id: author.id },
            defaults: { pages: row.pages },
          });

          // 3. Upsert Store
          let [store] = await db.Store.findOrCreate({
            where: { name: row.store_name, address: row.store_address },
          });

          // 4. Upsert StoreBook (inventory)
          let storeBook = await db.StoreBook.findOne({
            where: { store_id: store.id, book_id: book.id },
          });

          if (storeBook) {
            storeBook.copies += 1;
            await storeBook.save();
          } else {
            await db.StoreBook.create({
              store_id: store.id,
              book_id: book.id,
              price: row.price,
              copies: 1,
              sold_out: false,
            });
          }
        }

        res.json({ message: 'CSV processed successfully' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
      }
    });
}

module.exports = { uploadInventory };
