const {CREATED} = require('../core/success/success.response');
const DiscountService = require('../services/discount.service');

class DiscountController {
	createDiscountCode = async (req, res, next) => {
		return new CREATED({
			message: 'Discount code created',
			metadata: await DiscountService.createDiscountCode({
				...req.body,
				shop_id: req.user.userId
			}),
		}).send(res);
	}

	getAllDiscountCodes = async (req, res, next) => {
		return new CREATED({
			message: 'Discount code found',
			metadata: await DiscountService.getAllDiscountCodesByShop({
				...req.body,
				shop_id: req.user.userId
			}),
		}).send(res);
	}

	getDiscountAmount = async (req, res, next) => {
		return new CREATED({
			message: 'Discount code found',
			metadata: await DiscountService.getDiscountAmount({
				...req.body
			}),
		}).send(res);
	}

	getAllDiscountCodesWithProducts = async (req, res, next) => {
		return new CREATED({
			message: 'Discount code found',
			metadata: await DiscountService.getAllDiscountCodesWithProducts({
				...req.query
			}),
		}).send(res);
	}


}

module.exports = new DiscountController();