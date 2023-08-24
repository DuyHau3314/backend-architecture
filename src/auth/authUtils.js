const JWT = require('jsonwebtoken');

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

		JWT.verify(accessToken, publicKey, (err, decoded) => {
			console.log(`[P]::createTokenPair::accessToken::`, err, decoded);
		});

		return {
			accessToken,
			refreshToken,
		}
	} catch(error) {}
}

module.exports = {
	createTokenPair,
}