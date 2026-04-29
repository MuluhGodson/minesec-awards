const express = require('express');
const router = express.Router({ mergeParams: true });
const categoryPrizeController = require('../controllers/categoryPrizeController');

router.get('/', categoryPrizeController.getPrizes);
router.post('/', categoryPrizeController.addPrize);
router.put('/:prizeId', categoryPrizeController.updatePrize);
router.delete('/:prizeId', categoryPrizeController.deletePrize);

module.exports = router;
