const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Public form submission (unauthenticated)
router.post('/public/:categoryId', upload.array('documents', 5), applicationController.submitPublicApplication);

// Public endpoints
router.get('/laureates/recent', applicationController.getRecentLaureates);

// Admin queries
router.get('/category/:categoryId', applicationController.getCategoryApplications);
router.put('/:applicationId/shortlist', applicationController.shortlistApplication);
router.put('/:applicationId/revoke-shortlist', applicationController.revokeShortlist);
router.put('/:applicationId/select-winner', applicationController.selectWinner);
router.put('/:applicationId/revoke-winner', applicationController.revokeWinner);

module.exports = router;
