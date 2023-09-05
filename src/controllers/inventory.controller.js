const { CREATED, OK } = require("../core/success/success.response");
const InventoryService = require("../services/inventory.service");

class InventoryController {
	addStockToInventory = async (req, res, next) => {
		new OK({
			message: 'Checkout review successfully',
			metadata: await InventoryService.addStockToInventory(req.body)
		}).send(res);
	}
}

module.exports = new InventoryController();