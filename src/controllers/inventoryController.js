const fs = require('fs');
const csv = require('csv-parser');
const db = require('../models');
const path = require('path');

async function uploadInventory(req, res) {
  if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

  const filePath = req.file.path;
  const rows = [];

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    if (!rows.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    // Basic header validation - check first row keys
    const sample = rows[0];
    const expected = ['store_name', 'store_address', 'book_name', 'pages', 'author_name', 'price'];
    const keys = Object.keys(sample).map(k => k.trim().toLowerCase());
    const missing = expected.filter(e => !keys.includes(e));
    if (missing.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'CSV missing columns', missing });
    }

    // Process each row
    for (const rawRow of rows) {
      // normalize input fields (case-insensitive headers)
      const row = {};
      for (const k of Object.keys(rawRow)) {
        row[k.trim().toLowerCase()] = (rawRow[k] || '').toString().trim();
      }

      if (!row.store_name || !row.book_name || !row.author_name) {
        // skip incomplete rows
        continue;
      }

      const pages = Number.parseInt(row.pages, 10) || 0;
      const price = Number.parseFloat(row.price) || 0;

      // 1. Upsert Author
      const [author] = await db.Author.findOrCreate({
        where: { name: row.author_name },
        defaults: { name: row.author_name },
      });

      // 2. Upsert Book (unique by name + author_id)
      const [book] = await db.Book.findOrCreate({
        where: { name: row.book_name, author_id: author.id },
        defaults: { name: row.book_name, pages, author_id: author.id },
      });

      // 3. Upsert Store
      const [store] = await db.Store.findOrCreate({
        where: { name: row.store_name, address: row.store_address || '' },
        defaults: { name: row.store_name, address: row.store_address || '' },
      });

      // 4. Upsert StoreBook (inventory)
      let storeBook = await db.StoreBook.findOne({
        where: { store_id: store.id, book_id: book.id },
      });

      if (storeBook) {
        // increment copies and update price to latest provided
        storeBook.copies = (Number(storeBook.copies) || 0) + 1;
        if (!Number.isNaN(price)) storeBook.price = price;
        storeBook.sold_out = storeBook.copies <= 0 ? true : false;
        await storeBook.save();
      } else {
        await db.StoreBook.create({
          store_id: store.id,
          book_id: book.id,
          price,
          copies: 1,
          sold_out: false,
        });
      }
    }

    // cleanup uploaded file
    fs.unlinkSync(filePath);

    return res.json({ message: 'CSV processed successfully' });
  } catch (err) {
    console.error('CSV upload error:', err);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
    return res.status(500).json({ error: 'Server error during CSV processing' });
  }
}

module.exports = { uploadInventory };