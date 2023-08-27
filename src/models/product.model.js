const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new Schema({
	product_name: { type: String, required: true },
	product_thumb: { type: String, required: true },
	product_description: String,
	product_price: { type: Number, required: true },
	product_quantity: { type: Number, required: true },
	product_type: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture'] },
	product_shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
	product_attributes: { type: Schema.Types.Mixed, required: true },
}, {
	collection: COLLECTION_NAME,
	timestamps: true,
});

// define the product type = clothing

const clothingSchema = new Schema({
	brand: { type: String, required: true },
	size: String,
	material: String,
	product_shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
}, {
	collection: 'Clothing',
	timestamps: true,
});

// define the product type = electronics

const electronicsSchema = new Schema({
	manufacture: { type: String, required: true },
	model: String,
	color: String,
	product_shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
}, {
	collection: 'Electronics',
	timestamps: true,
});

const furnitureSchema = new Schema({
	brand: { type: String, required: true },
	size: String,
	material: String,
	product_shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
}, {
	collection: 'Furniture',
	timestamps: true,
});

module.exports = {
	product: model(DOCUMENT_NAME, productSchema),
	clothing: model('Clothing', clothingSchema),
	electronics: model('Electronics', electronicsSchema),
	furniture: model('Furniture', furnitureSchema),
}