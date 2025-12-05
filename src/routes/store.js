const express = require('express');
const router = express.Router();
const { generateStoreReport } = require('../controllers/storeController');

router.get('/:id/download-report', generateStoreReport);

module.exports = router;
