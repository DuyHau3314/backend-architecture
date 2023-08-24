const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandle } = require('../../auth/checkAuth');
const router = express.Router();

router.post('/shop/signup', asyncHandle(accessController.signUp));

module.exports = router;
