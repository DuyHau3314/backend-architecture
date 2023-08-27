
// Define Factory class to create product

const { product, clothing, electronics } = require("../models/product.model");
const { BadRequestError } = require("../core/error/error.response");

class ProductFactory {
	/*
		type: 'Clothing' | 'Electronics'
		payload
	*/
	static async createProduct(type, payload){
		switch(type){
			case 'Clothing':
				return await new Clothing(payload).createProduct();
			case 'Electronics':
				return await new Electronics(payload).createProduct();
			default:
				throw new BadRequestError('Invalid product type');
		}
	}
}
/*
{
	product_name: { type: String, required: true },
	product_thumb: { type: String, required: true },
	product_description: String,
	product_price: { type: Number, required: true },
	product_quantity: { type: Number, required: true },
	product_types: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture'] },
	product_shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
	product_attributes: { type: Schema.Types.Mixed, required: true },
}
*/
class Product {
	constructor({product_name, product_thumb, product_description, product_price, product_quantity, product_type, product_shop, product_attributes}){
		this.product_name = product_name;
		this.product_thumb = product_thumb;
		this.product_description = product_description;
		this.product_price = product_price;
		this.product_quantity = product_quantity;
		this.product_type = product_type;
		this.product_shop = product_shop;
		this.product_attributes = product_attributes;
	}

	async createProduct(product_id) {
		return await product.create({
			...this,
			_id: product_id,
		});
	}
}

class Clothing extends Product {
	async createProduct() {
		const newClothing = await clothing.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});

		if(!newClothing) throw new BadRequestError('Cannot create new clothing');

		const newProduct = await super.createProduct(newClothing._id);

		if(!newProduct) throw new BadRequestError('Cannot create new product');

		return newProduct;
	}
}

class Electronics extends Product {
	async createProduct() {
		const newElectronics = await electronics.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});

		if(!newElectronics) throw new BadRequestError('Cannot create new electronics');

		const newProduct = await super.createProduct(newElectronics._id);

		if(!newProduct) throw new BadRequestError('Cannot create new product');

		return newProduct;
	}
}

module.exports = ProductFactory