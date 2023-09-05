const express = require('express');
const inventoryService = require('../../controllers/inventory.controller');
const { authenticationV2 } = require('../../auth/authUtils');
const asyncHandle = require('../../helpers/asyncHandler');
const router = express.Router();

router.use(authenticationV2);
router.post('/review', asyncHandle(inventoryService.addStockToInventory));

module.exports = router;
