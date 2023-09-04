const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'carts';

const cartSchema = new Schema({
	cart_state: {
		type: String,
		required: true,
		enum: ['active', 'inactive', 'failed', 'pending'],
		default: 'active'
	},
	cart_products: {
		type: Array,
		required: true,
		default: []
	},
	/*
		[
			{
				productId: 'productId',
				quantity: 1,
				shopId: 'shopId',
				name: 'name',
				price: 100,
			}
		]
	*/
	cart_count_product: { type: Number, required: true, default: 0 },
	cart_userId: { type: Number, required: true },
}, {
	timestamps: true,
	collection: COLLECTION_NAME
});

module.exports = {
	cart: model(DOCUMENT_NAME, cartSchema),
}