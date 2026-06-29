const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.post('/:categoryId/congratulate', categoryController.congratulateWinners);

const categoryTimelineRoutes = require('./categoryTimeline');
const categorySponsorsRoutes = require('./categorySponsors');
const categoryPrizesRoutes = require('./categoryPrizes');

router.use('/:categoryId/timeline', categoryTimelineRoutes);
router.use('/:categoryId/sponsors', categorySponsorsRoutes);
router.use('/:categoryId/prizes', categoryPrizesRoutes);

module.exports = router;
