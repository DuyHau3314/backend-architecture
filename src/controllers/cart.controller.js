const { CREATED, OK } = require("../core/success/success.response");
const CartService = require("../services/cart.service");

class CartController {
	/**
	 * @desc add to cart
	 * @param {*} req
	 * @param {*} res
	 * @param {*} next
	 * @method POST
	 * @url /v1/api/cart/user
	 * @response {Object} cart
	 */
	async addToCart(req, res, next){
		new CREATED({
			message: 'Add to cart successfully',
			metadata: await CartService.addToCart(req.body)
		}).send(res);
	}

	// update + -
	async updateCart(req, res, next){
		new OK({
			message: 'Update cart successfully',
			metadata: await CartService.addToCartV2(req.body)
		}).send(res);
	}

	async deleteCart(req, res, next){
		new OK({
			message: 'Delete cart successfully',
			metadata: await CartService.deleteUserCart(req.body)
		}).send(res);
	}

	async listToCart(req, res, next){
		new OK({
			message: 'Get cart successfully',
			metadata: await CartService.getListUserCart(req.query)
		}).send(res);
	}
}

module.exports = new CartController();