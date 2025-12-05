// src/routes/inventory.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { uploadInventory } = require('../controllers/inventoryController');

router.post('/upload', upload.single('file'), uploadInventory);

module.exports = router;
