const { inventory } = require("../inventory.model");
const { Types } = require("mongoose")

const insertInventory = async ({productId, shopId, stock = 0, location = 'unKnown'}) => {
	return await inventory.create({
		inven_productId: new Types.ObjectId(productId),
		inven_location: location,
		inven_stock: stock,
		inven_shopId: new Types.ObjectId(shopId),
		inven_reservations: [],
	});
}

module.exports = {
	insertInventory,
}