require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 8000;
const app = express();
const db = require('./src/models');

const inventoryRoutes = require('./src/routes/inventory');
const storeRoutes = require('./src/routes/store');

// Ensure required folders exist
const REPORTS_DIR = path.join(__dirname, 'reports');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(express.json());

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/store', storeRoutes);

// Sync DB and start server
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Unable to sync database:', err);
    process.exit(1);
  });

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
