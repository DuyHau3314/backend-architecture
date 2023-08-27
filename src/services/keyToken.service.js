const { Schema, Types } = require("mongoose");
const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
	static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
			// level0
			// const tokens = await keytokenModel.create({
			// 	user: userId,
			// 	publicKey,
			// 	privateKey
			// })

			// return tokens ? tokens.publicKey : null;

			// levelxxx
			const filter = { user: new Types.ObjectId(userId) };
			const update = { publicKey, privateKey, refreshToken, refreshTokensUsed: [] };
			const options = { upsert: true, new: true };
			const tokens = await keytokenModel.findOneAndUpdate(filter, update, options);

			return tokens ? tokens.publicKey : null;
		}


	static findByUserId = async (userId) => {
		const tokens = await keytokenModel.findOne({ user: new Types.ObjectId(userId) }).lean();

		return tokens;
		}

	static removeKeyById = async (id) => {
		const result = await keytokenModel.findByIdAndDelete(id);

		return result;
	}

	static findByRefreshTokenUsed = async (refreshToken) => {
		return await keytokenModel.findOne({ refreshTokensUsed: { $in: [refreshToken] } }).lean();
	}

	static findByRefreshToken = async (refreshToken) => {
		return await keytokenModel.findOne({ refreshToken }).lean();
	}

	static deleteKeyById = async (userId) => {
		const result = await keytokenModel.deleteOne({ user: new Types.ObjectId(userId) });

		return result;
	}
}

module.exports = KeyTokenService;