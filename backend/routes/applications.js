const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const multer = require('multer');

// Configure multer to hold the file buffers in memory (RAM) 
// instead of writing them to the local disk.
const upload = multer({ storage: multer.memoryStorage() });

// Public form submission (unauthenticated)
router.post('/public/:categoryId', upload.array('documents', 5), applicationController.submitPublicApplication);

// Public endpoints
router.get('/laureates/recent', applicationController.getRecentLaureates);
router.get('/laureates/category/:categoryId', applicationController.getLaureatesByCategory);

// Admin queries
router.get('/category/:categoryId', applicationController.getCategoryApplications);
router.put('/:applicationId/shortlist', applicationController.shortlistApplication);
router.put('/:applicationId/revoke-shortlist', applicationController.revokeShortlist);
router.put('/:applicationId/select-winner', applicationController.selectWinner);
router.put('/:applicationId/revoke-winner', applicationController.revokeWinner);

module.exports = router;