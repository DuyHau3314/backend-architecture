const { convertToObjectIdMongodb } = require("../../utils");
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

const reservationInventory = async ({productId, quantity, cartId}) => {
	const query = {
		inven_productId: convertToObjectIdMongodb(productId),
		inven_stock: { $gte: quantity },
	}, updateSet = {
		$inc: { inven_stock: -quantity },
		$push: { inven_reservations: { cartId, quantity, createOn: new Date() } }
	}, options = {
		new: true,
		upsert: true
	}

	return await inventory.updateOne(query, updateSet, options);
}

module.exports = {
	insertInventory,
	reservationInventory
}