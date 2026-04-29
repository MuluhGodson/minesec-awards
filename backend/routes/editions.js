const express = require('express');
const router = express.Router();
const editionController = require('../controllers/editionController');

router.get('/', editionController.getAllEditions);
router.get('/:id', editionController.getEditionById);
router.post('/', editionController.createEdition);
router.put('/:id', editionController.updateEdition);

module.exports = router;
