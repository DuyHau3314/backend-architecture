const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'discounts';

const discountSchema = new Schema({
	discount_name: { type: String, required: true },
	discount_description: { type: String, required: true },
	discount_type: { type: String, required: true, default: 'fix_amount'}, //percentage
	discount_value: { type: Number, required: true }, //10.000 or 10
	discount_code: { type: String, required: true },
	discount_start_date: { type: Date, required: true },
	discount_end_date: { type: Date, required: true },
	discount_max_uses: { type: Number, required: true }, //so luong discount toi da
	discount_uses_count: { type: Number, required: true }, // so luong discount da su dung
	discount_users_used: { type: Array, required: true, default: [] }, // danh sach user da su dung discount
	discount_max_per_user: { type: Number, required: true }, // so luong discount toi da moi user
	discount_min_order_value: { type: Number, required: true }, // so tien toi thieu de su dung discount
	discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
	discount_is_active: { type: Boolean, required: true, default: true },
	discount_applies_to: { type: String, required: true, default: 'all', enum: ['all', 'specific'] },
	discount_product_ids: { type: Array, default: [] }, // danh sach product id
}, {
	timestamps: true,
	collection: COLLECTION_NAME
});

module.exports = {
	discount: model(DOCUMENT_NAME, discountSchema),
}