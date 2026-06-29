const express = require('express');
const router = express.Router({ mergeParams: true }); // Important: mergeParams to get :categoryId from parent router
const categoryTimelineController = require('../controllers/categoryTimelineController');

// Note: This router is mounted at /api/categories/:categoryId/timeline in server.js
// So the path here is just '/'

router.get('/', categoryTimelineController.getTimelineSteps);
router.post('/', categoryTimelineController.createTimelineStep);
router.put('/:stepId', categoryTimelineController.updateTimelineStep);
router.delete('/:stepId', categoryTimelineController.deleteTimelineStep);

// Temporal Jury Management
router.get('/:stepId/jury', categoryTimelineController.getJuryMembers);
router.post('/:stepId/jury', categoryTimelineController.addJuryMember);
router.delete('/:stepId/jury/:juryId', categoryTimelineController.removeJuryMember);

// Candidate Advancement
router.post('/:stepId/advance-candidates', categoryTimelineController.advanceCandidates);
router.get('/:stepId/votes', categoryTimelineController.getStepVotes);

module.exports = router;
