const { findCartById } = require("../models/repository/cart.repo");
const { BadRequestError } = require('../core/error/error.response');
const { checkProductByServer } = require("../models/repository/product.repo");
const DiscountService = require("./discount.service");
class CheckoutService {
	// login and without login
	/*
		{
			cartId: 1,
			userId: 1,
			shop_order_ids: [
				{
					shop_id: 1,
					shop_discounts:[],
					item_products: [
						{
							price,
							quantity,
							productId,
						}
					],
				},
				{
					shop_id: 2,
					shop_discounts:[
						{
							shopId,
							discountId,
							codeId
						}
					],
					item_products: [
						{
							price,
							quantity,
							productId,
						}
					]
				}
			]
		}
	*/
	static async checkoutReview({
		cartId, userId, shop_order_ids
	}) {
		// check cartId exist
		const foundCart = await findCartById(cartId);

		if(!foundCart) {
			throw new BadRequestError('Cart not found');
		}

		const checkout_order = {
			totalPrice: 0,
			feeShip: 0,
			totalDiscount: 0,
			totalCheckout: 0,
		}, shop_order_ids_new = [];

		// total bill
		for(let i = 0; i < shop_order_ids.length; i++) {
			const { shop_id, shop_discounts, item_products } = shop_order_ids[i];
			// check product available
			const checkProductServer = await checkProductByServer(item_products);

			if(!checkProductServer[0]) {
				throw new BadRequestError('Order wrong product');
			}

			// sum price
			const checkoutPrice = checkProductServer.reduce((acc, product) => {
				const { price, quantity } = product;
				return acc + (price * quantity);
			}, 0);

			// sum price before discount
			checkout_order.totalPrice += checkoutPrice;

			const itemCheckout = {
				shop_id,
				shop_discounts,
				priceRaw: checkoutPrice,
				priceApplyDiscount: checkoutPrice,
				item_products: checkProductServer
			}

			// if shop_discounts exist > 0, check valid discount or not
			if(shop_discounts.length > 0) {
				const { totalPrice, discount = 0 } =  await DiscountService.getDiscountAmount({
					code: shop_discounts[0].code,
					userId,
					shopId: shop_id,
					products: checkProductServer
				})

				// sum discount
				checkout_order.totalDiscount += discount;

				if(discount > 0) {
					itemCheckout.priceApplyDiscount = checkoutPrice - discount;
				}
			}

			// sum total checkout
			checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
			shop_order_ids_new.push(itemCheckout);
		}

		return {
			shop_order_ids,
			shop_order_ids_new,
			checkout_order
		}
	}
}

module.exports = CheckoutService;