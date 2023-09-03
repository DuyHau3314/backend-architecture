const express = require('express');
const discountController = require('../../controllers/discount.controller');
const { authenticationV2 } = require('../../auth/authUtils');
const asyncHandle = require('../../helpers/asyncHandler');
const router = express.Router();

router.post('/amount', asyncHandle(discountController.getDiscountAmount));
router.get('/list_product_code', asyncHandle(discountController.getAllDiscountCodesWithProducts));

router.use(authenticationV2);


router.post('/', asyncHandle(discountController.createDiscountCode));
router.get('/', asyncHandle(discountController.getAllDiscountCodesWithProducts));

module.exports = router;
