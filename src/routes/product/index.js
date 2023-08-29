const express = require('express');
const productController = require('../../controllers/product.controller');
const { authenticationV2 } = require('../../auth/authUtils');
const asyncHandle = require('../../helpers/asyncHandler');
const router = express.Router();

router.get('/search/:keySearch', asyncHandle(productController.getListSearchProducts));

router.use(authenticationV2);

router.post('/', asyncHandle(productController.createProduct));
router.put('/publish/:id', asyncHandle(productController.publishProductByShop));
router.put('/unpublish/:id', asyncHandle(productController.unpublishProductByShop));

// QUERY: ?limit=10&skip=0
router.get('/draft/all', asyncHandle(productController.getAllDraftsForShop));
router.get('/published/all', asyncHandle(productController.getAllPublishedForShop));

module.exports = router;
