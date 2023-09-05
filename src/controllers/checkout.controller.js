const { CREATED, OK } = require("../core/success/success.response");
const CheckoutService = require("../services/checkout.service")

class CheckoutController {
	checkoutReview = async (req, res, next) => {
		new CREATED({
			message: 'Checkout review successfully',
			metadata: await CheckoutService.checkoutReview(req.body)
		}).send(res);
	}
}

module.exports = new CheckoutController();