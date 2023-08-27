const express = require('express');
const accessController = require('../../controllers/access.controller');
const asyncHandle = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.post('/shop/login', asyncHandle(accessController.login));
router.post('/shop/signup', asyncHandle(accessController.signUp));

router.use(authenticationV2);

router.post('/shop/logout', asyncHandle(accessController.logout));
router.post('/shop/refresh-token', asyncHandle(accessController.handleRefreshToken));

module.exports = router;
