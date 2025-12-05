const PDFDocument = require('pdfkit');
const db = require('../models');
const fs = require('fs');
const path = require('path');

async function generateStoreReport(req, res) {
  try {
    const storeId = Number(req.params.id);
    if (!storeId) return res.status(404).json({ error: 'Invalid store id' });

    const store = await db.Store.findByPk(storeId);
    if (!store) return res.status(404).json({ error: 'Store not found' });

    // Top 5 priciest books
    const topBooks = await db.StoreBook.findAll({
      where: { store_id: storeId },
      include: [
        {
          model: db.Book,
          as: 'Book',
          include: [{ model: db.Author, as: 'Author' }],
        },
      ],      
      order: [['price', 'DESC']],
      limit: 5,
    });

    // Top 5 prolific authors
    const authors = await db.Book.findAll({
      include: [
        {
          model: db.Store,
          as: 'Stores',
          where: { id: storeId },
          through: { attributes: [] },
        },
        { model: db.Author, as: 'Author' },
      ],
    });

    const authorCounts = {};
    booksInStore.forEach((b) => {
      const auth = b.Author;
      if (!auth) return;
      const key = `${auth.id}::${auth.name}`;
      authorCounts[key] = (authorCounts[key] || 0) + 1;
    });

    const topAuthors = Object.entries(authorCounts)
      .map(([k, count]) => {
        const [, name] = k.split('::');
        return { name, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const filename = `${store.name.replace(/[^a-z0-9_-]/gi, '_')}-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    const filepath = path.join(__dirname, '../../reports', filename);

    const doc = new PDFDocument({ margin: 40 });
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    doc.fontSize(18).text(`Store Report: ${store.name}`, { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(14).text('Top 5 Priciest Books:', { underline: true });
    doc.moveDown(0.5);
    if (topBooks.length === 0) {
      doc.text('No books found for this store.');
    } else {
      topBooks.forEach((sb, i) => {
        const book = sb.Book || {};
        const author = book.Author || {};
        doc.text(`${i + 1}. ${book.name || 'N/A'} by ${author.name || 'N/A'} — $${Number(sb.price).toFixed(2)} (copies: ${sb.copies})`);
      });
    }

    doc.moveDown(1.2);
    doc.fontSize(14).text('Top 5 Prolific Authors:', { underline: true });
    doc.moveDown(0.5);
    if (topAuthors.length === 0) {
      doc.text('No authors found for this store.');
    } else {
      topAuthors.forEach((a, i) => {
        doc.text(`${i + 1}. ${a.name} — ${a.count} book(s)`);
      });
    }

    doc.end();

    // Wait until file write is finished then send
    writeStream.on('finish', () => {
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).end();
        }
      });
    });

    writeStream.on('error', (err) => {
      console.error('Write stream error:', err);
      res.status(500).json({ error: 'Failed to generate PDF' });
    });
  } catch (err) {
    console.error('Report generation error:', err);
    res.status(500).json({ error: 'Server error generating report' });
  }
}

module.exports = { generateStoreReport };