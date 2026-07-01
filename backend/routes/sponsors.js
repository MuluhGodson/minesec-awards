const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const multer = require('multer');

// Configure multer to hold the file buffer in memory (RAM) 
// instead of writing it to the local disk.
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.get('/', sponsorController.getAllSponsors);
router.post('/', upload.single('logo'), sponsorController.createSponsor);

module.exports = router;