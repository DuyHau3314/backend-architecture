const { default: mongoose } = require("mongoose");

const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'Keys';

const keySchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Shop',
		required: true,
	},
	publicKey: {
		type: String,
		required: true,
	},
	privateKey: {
		type: String,
		required: true,
	},
	refreshToken: {
		type: Array,
		default: [],
	}
}, {
	collection: COLLECTION_NAME,
});

module.exports = mongoose.model(DOCUMENT_NAME, keySchema);