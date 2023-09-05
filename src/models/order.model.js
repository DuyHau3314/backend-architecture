const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'orders';

const orderSchema = new Schema({
	order_userId: {
		type: Number,
		required: true
	},

	/*
		order_checkout = {
			totalPrice,
			totalApplyDiscount,
			feeShip,
		}
	*/
	order_checkout: {
		type: Object,
		required: true,
		default: {}
	},
	/*
		street, city, state, country
	 */
	order_shipping: {
		type: Object,
		required: true,
	},
	order_payment: {
		type: Object,
		required: true,
	},
	order_products: {
		type: Array,
		required: true,
	},
	order_trackingNumber: {
		type: String,
		required: true,
		default: '#0000011805002'
	},
	order_status: {
		type: String,
		enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
		default: 'pending'
	}
}, {
	collection: COLLECTION_NAME,
	timestamps: true
})

module.exports = {
	order: model(DOCUMENT_NAME, orderSchema),
}