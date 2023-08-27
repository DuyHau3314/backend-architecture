const JWT = require('jsonwebtoken');
const { asyncHandle } = require('./checkAuth');
const { ForbiddenError, NotFoundError } = require('../core/error/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
	CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
	REFRESH_TOKEN: 'x-rtoken-id',
};

const createTokenPair = async (payload, publicKey, privateKey) => {
	try {
		// create accessToken
		const accessToken = await JWT.sign(payload, publicKey, {
			expiresIn: '1h',
		});

		// create refreshToken
		const refreshToken = await JWT.sign(payload, privateKey, {
			expiresIn: '1d',
		});

		return {
			accessToken,
			refreshToken
		}
	} catch(error) {
		throw error;
	}
};

const authenticationV2 = asyncHandle(async (req, res, next) => {
	const userId = req.headers[HEADER.CLIENT_ID];

	if (!userId) {
		throw new ForbiddenError('Invalid request');
	}

	const keyStore = await findByUserId(userId);

	if (!keyStore) {
		throw new NotFoundError('KeyStore Invalid request');
	}

	if(req.headers[HEADER.REFRESH_TOKEN]) {
		try {
			const decodeUser = JWT.verify(req.headers[HEADER.REFRESH_TOKEN], keyStore.privateKey);

			if(userId !== decodeUser.userId) {
				throw new ForbiddenError('Invalid request');
			}

			req.keyStore = keyStore;
			req.user = decodeUser;
			req.refreshToken = req.headers[HEADER.REFRESH_TOKEN];
			next();
		} catch(error) {
			throw error;
		}
	}

	if(req.headers[HEADER.AUTHORIZATION]) {
		try {
			const decodeUser = JWT.verify(req.headers[HEADER.AUTHORIZATION], keyStore.publicKey);

			if(userId !== decodeUser.userId) {
				throw new ForbiddenError('Invalid request');
			}

			req.keyStore = keyStore;
			req.user = decodeUser;
			next();
		} catch(error) {
			throw error;
		}
	}
});

const verifyJWT = async (toke, keySecret) => {
	return await JWT.verify(toke, keySecret);
}

module.exports = {
	createTokenPair,
	verifyJWT,
	authenticationV2
}