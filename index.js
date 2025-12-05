const express = require('express');
const app = express();
const db = require('./src/models');
const inventoryRoutes = require('./src/routes/inventory');
const storeRoutes = require('./src/routes/store');

app.use(express.json());

// Sync DB
db.sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
});

//inventory routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/store', storeRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
