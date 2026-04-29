const express = require('express');
const router = express.Router();
const recipientTypeController = require('../controllers/recipientTypeController');

router.get('/', recipientTypeController.getAllRecipientTypes);
router.post('/', recipientTypeController.createRecipientType);
router.put('/:id', recipientTypeController.updateRecipientType);
router.delete('/:id', recipientTypeController.deleteRecipientType);

module.exports = router;
