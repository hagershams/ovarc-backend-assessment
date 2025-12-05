const PDFDocument = require('pdfkit');
const db = require('../models');
const fs = require('fs');
const path = require('path');

async function generateStoreReport(req, res) {
  try {
    const storeId = req.params.id;
    const store = await db.Store.findByPk(storeId);

    if (!store) return res.status(404).json({ error: 'Store not found' });

    // Top 5 priciest books
    const topBooks = await db.StoreBook.findAll({
      where: { store_id: storeId },
      include: [{ model: db.Book, include: [db.Author] }],
      order: [['price', 'DESC']],
      limit: 5,
    });

    // Top 5 prolific authors
    const authors = await db.Book.findAll({
      include: [
        {
          model: db.Store,
          where: { id: storeId },
          through: { attributes: [] },
        },
        db.Author,
      ],
    });

    const authorCounts = {};
    authors.forEach((book) => {
      const name = book.Author.name;
      authorCounts[name] = (authorCounts[name] || 0) + 1;
    });

    const topAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Generate PDF
    const doc = new PDFDocument();
    const filename = `${store.name}-Report-${new Date()
      .toISOString()
      .split('T')[0]}.pdf`;
    const filepath = path.join(__dirname, '../../reports', filename);

    // Ensure reports folder exists
    fs.mkdirSync(path.join(__dirname, '../../reports'), { recursive: true });

    doc.pipe(fs.createWriteStream(filepath));

    doc.fontSize(20).text(`Store Report: ${store.name}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text('Top 5 Priciest Books:');
    topBooks.forEach((sb, i) => {
      doc.text(
        `${i + 1}. ${sb.Book.name} by ${sb.Book.Author.name} - $${sb.price}`
      );
    });
    doc.moveDown();

    doc.fontSize(16).text('Top 5 Prolific Authors:');
    topAuthors.forEach(([name, count], i) => {
      doc.text(`${i + 1}. ${name} - ${count} book(s)`);
    });

    doc.end();

    res.download(filepath, filename);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { generateStoreReport };
