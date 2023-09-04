const express = require('express');
const cartController = require('../../controllers/cart.controller');
const { authenticationV2 } = require('../../auth/authUtils');
const asyncHandle = require('../../helpers/asyncHandler');
const router = express.Router();

router.post('', asyncHandle(cartController.addToCart));
router.delete('', asyncHandle(cartController.deleteCart));
router.post('/update', asyncHandle(cartController.updateCart));
router.get('', asyncHandle(cartController.listToCart));

module.exports = router;
