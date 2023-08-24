const { ForbiddenError } = require('../core/error/error.response');
const { findById } = require('../services/apikey.service');
const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
};

const asyncHandle = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}

const apiKey = asyncHandle(async (req, res, next) => {
    const key = req.headers[HEADER.API_KEY].toString();

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
