const express = require('express');
const router = express.Router({ mergeParams: true });
const categorySponsorController = require('../controllers/categorySponsorController');

router.get('/', categorySponsorController.getCategorySponsors);
router.post('/', categorySponsorController.addCategorySponsor);
router.delete('/:sponsorId', categorySponsorController.removeCategorySponsor);

module.exports = router;
