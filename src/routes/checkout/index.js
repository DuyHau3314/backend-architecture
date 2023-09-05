const express = require('express');
const checkoutController = require('../../controllers/checkout.controller');
const { authenticationV2 } = require('../../auth/authUtils');
const asyncHandle = require('../../helpers/asyncHandler');
const router = express.Router();

router.post('/review', asyncHandle(checkoutController.checkoutReview));

module.exports = router;
