const { ForbiddenError } = require('../core/error/error.response');
const asyncHandle = require('../helpers/asyncHandler');
const apikeyModel = require('../models/apikey.model');
const { findById } = require('../services/apikey.service');
const crypto = require('node:crypto');

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
};

const apiKey = asyncHandle(async (req, res, next) => {
    const key = req.headers[HEADER.API_KEY];

    // create api key
    // const apiKey =  await apikeyModel.create({
    //     key: crypto.randomBytes(64).toString('hex'),
    //     permissions: ['0000'],
    //     status: true,
    // })

    if (!key) {
        return res.status(403).json({
            message: 'Forbidden',
        });
    }

    const objKey = await findById(key);

    if (!objKey) {
        throw new ForbiddenError();
    }

    req.apiKey = objKey;
    next();
})

const permission = (permission) => (req, res, next) => {
    if (!req.apiKey.permissions.includes(permission)) {
        return res.status(403).json({
            message: 'Forbidden',
        });
    }

    next();
};


module.exports = {
    apiKey,
    permission,
    asyncHandle
};
