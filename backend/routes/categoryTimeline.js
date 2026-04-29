const express = require('express');
const router = express.Router({ mergeParams: true }); // Important: mergeParams to get :categoryId from parent router
const categoryTimelineController = require('../controllers/categoryTimelineController');

// Note: This router is mounted at /api/categories/:categoryId/timeline in server.js
// So the path here is just '/'

router.get('/', categoryTimelineController.getTimelineSteps);
router.post('/', categoryTimelineController.createTimelineStep);
router.put('/:stepId', categoryTimelineController.updateTimelineStep);
router.delete('/:stepId', categoryTimelineController.deleteTimelineStep);

module.exports = router;
