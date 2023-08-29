
// Define Factory class to create product

const { product, clothing, electronics, furniture } = require("../models/product.model");
const { BadRequestError } = require("../core/error/error.response");
const { findAllProductsForShop, publishProductByShop, unpublishProductByShop, searchProductByUser, findAllProducts, findProduct } = require("../models/repository/product.repo");

class ProductFactory {
	/*
		type: 'Clothing' | 'Electronics'
		payload
	*/

	static productRegistry = {}; //key-class

	static registerProductType(type, productClass){
		ProductFactory.productRegistry[type] = productClass;
	}

	static async createProduct(type, payload){
		const productClass = ProductFactory.productRegistry[type];

		if(!productClass) throw new BadRequestError('Invalid product type');

		return await new productClass(payload).createProduct();
	}

	static async updateProduct({type, payload}) {

	}

	// PUT
	static async publishProductByShop({product_shop, product_id}){
		return await publishProductByShop({product_shop, product_id});
	}

	static async unpublishProductByShop({product_shop, product_id}) {
		return await unpublishProductByShop({product_shop, product_id});
	}

	static async findAllDraftsForShop({product_shop, limit = 50, skip = 0}){
		const query = { product_shop, isDraft: true };
		return await findAllProductsForShop({query, limit, skip});
	}

	static async findAllPublishedForShop({product_shop, limit = 50, skip = 0}){
		const query = { product_shop, isPublished: true };
		return await findAllProductsForShop({query, limit, skip});
	}

	static async searchProducts({limit = 50, skip = 0, keySearch}){
		return await searchProductByUser({limit, skip, keySearch});
	}

	static async finAllProducts({limit =50, sort = 'ctime', page = 1, filter = { isPublished: true},  select = ['product_name', 'product_price', 'product_thumb']}) {
		return await findAllProducts({limit, sort, page, filter, select});
	}

	static async findProduct ({product_id, unSelect = ['__v', 'product_variations']}) {
		return await findProduct({product_id, unSelect});
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

class Furniture extends Product {
	async createProduct() {
		const newFurniture = await furniture.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});

		if(!newFurniture) throw new BadRequestError('Cannot create new furniture');

		const newProduct = await super.createProduct(newFurniture._id);

		if(!newProduct) throw new BadRequestError('Cannot create new product');

		return newProduct;
	}
}

// register product type
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory