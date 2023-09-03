
// Define Factory class to create product

const { product, clothing, electronics, furniture } = require("../models/product.model");
const { BadRequestError } = require("../core/error/error.response");
const { findAllProductsForShop, publishProductByShop, unpublishProductByShop, searchProductByUser, findAllProducts, findProduct, updateProductById } = require("../models/repository/product.repo");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");
const { insertInventory } = require("../models/repository/inventory.repo");

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

	static async updateProduct(type, product_id, payload) {
		const productClass = ProductFactory.productRegistry[type];

		if(!productClass) throw new BadRequestError('Invalid product type');

		return await new productClass(payload).updateProduct(product_id);
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
		const newProduct = await product.create({
			...this,
			_id: product_id,
		});

		if(newProduct) {
			await insertInventory({
				productId: newProduct._id,
				shopId: this.product_shop,
				stock: this.product_quantity,
				location: 'unKnown',
			})
		}

		return newProduct;
	}

	async updateProduct(product_id, payload) {
		return await updateProductById({product_id, payload, model: product, isNew: true});
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

	async updateProduct(productId) {
		const objectParams = this;

		if(objectParams.product_attributes){
			// update child
			await updateProductById({product_id: productId, payload: objectParams, model: clothing, isNew: true});
		}

		const updateProduct = await super.updateProduct(productId, objectParams);

		return updateProduct;
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

	async updateProduct(productId) {
		const objectParams = this;

		if(objectParams.product_attributes){
			// update child
			await updateProductById({product_id: productId, payload: objectParams, model: electronics, isNew: true});
		}

		const updateProduct = await super.updateProduct(productId, objectParams);

		return updateProduct;
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

	async updateProduct(productId) {
		const objectParams = removeUndefinedObject(this);

		if(objectParams.product_attributes){
			// update child
			await updateProductById({product_id: productId, payload: updateNestedObjectParser(objectParams.product_attributes), model: furniture, isNew: true});
		}

		const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
		return updateProduct;
	}
}

// register product type
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory