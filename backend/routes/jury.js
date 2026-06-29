const express = require('express');
const router = express.Router();
const juryController = require('../controllers/juryController');

// Public endpoints, protected by the temporal token in the URL
router.get('/evaluate/:token', juryController.getEvaluationData);
router.post('/evaluate/:token/vote', juryController.submitVotes);

module.exports = router;
