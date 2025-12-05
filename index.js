const express = require('express');
const app = express();
const db = require('./src/models');
const inventoryRoutes = require('./src/routes/inventory');

app.use(express.json());

// Sync DB
db.sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
