const { BadRequestError } = require("../core/error/error.response");
const { inventory } = require("../models/inventory.model");
const { getProductById } = require("../models/repository/product.repo");

class InventoryService {
	static async addStockToInventory({stock, productId, shopId, location = '123, Tran Phu, Ha Noi'}) {
		const product = await getProductById(productId);

		if(!product) {
			throw new BadRequestError('Product not found');
		}

		const query = {
			inven_shopId: shopId,
			inven_productId: productId,
		},
		updateSet = {
			$inc: {
				inven_stock: stock,
			},
			$set: {
				inven_location: location,
			}
		}, options = {
			upsert: true,
			new: true,
		}

		return await inventory.findOneAndUpdate(query, updateSet, options);
	}
}

module.exports = InventoryService;