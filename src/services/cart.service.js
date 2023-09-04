const { NotFoundError, BadRequestError } = require("../core/error/error.response");
const { cart } = require("../models/cart.model");
const { getProductById } = require("../models/repository/product.repo");

/**
 * Key features: Card Service
 * - add product to cart [user]
 * - reduce quantity product from cart [user]
 * - increase quantity product from cart [user]
 * - get cart [user]
 * - Delete cart [user]
 * - Delete cart item [admin]
 */

class CartService {

	// START REPO CART //
	static async createCart({userId, product = {}}){
		const query = {
			cart_userId: +userId,
			cart_state: 'active'
		}, updateOrInsert = {
			$addToSet: {
				cart_products: product
			},
			$inc: {
				cart_count_product: 1
			}
		}, options = { upsert: true, new: true };

		return await cart.findOneAndUpdate(query, updateOrInsert, options);
	}

	static async updateUserCartQuantity({userId, product}){
		console.log('===updateUserCartQuantity', product);
		const {productId, quantity} = product;
		const query = {
			cart_userId: +userId,
			'cart_products.productId': productId,
			cart_state: 'active'
		}, updateSet = {
			$inc: {
				'cart_products.$.quantity': quantity
			}
		}, options = { upsert: true, new: true };

		return await cart.findOneAndUpdate(query, updateSet, options);
	}
	// END REPO CART //

	static async addToCart({userId, product = {}}){
		// check if product is already in cart
		const userCart = await cart.findOne({cart_userId: userId});

		if(!userCart){
			// create cart for User
			return await this.createCart({userId, product});
		}

		// if have cart but not have product
		if(!userCart.cart_products.length){
			userCart.cart_products = [product];
			return await userCart.save();
		}

		// if have cart and have product
		return await this.updateUserCartQuantity({userId, product});
	}

	// Update cart
	/*
		shop_order_ids: [
			{
				shopId: 'shopId',
				item_products: [
					{
						quantity,
						price,
						shopId,
						old_quantity,
						productId
					}
				]
			}
		]
	 */
	static async addToCartV2({userId, shop_order_ids}) {
		const {productId, quantity, old_quantity} = shop_order_ids[0]?.item_products[0];

		const foundProduct = await getProductById(productId);

		if(!foundProduct) throw new NotFoundError('Product not found');

		console.log('===foundProduct', foundProduct);
		console.log('===shop_order_ids', shop_order_ids[0])
		if(foundProduct.product_shop.toString() !== shop_order_ids[0].shopId) throw new BadRequestError('Product not found in shop');

		if(quantity === 0){
			// deleted
		}

		return await CartService.updateUserCartQuantity({
			userId,
			product: {
				productId,
				quantity: quantity - old_quantity
			}
		});
	}

	static async deleteUserCart({userId, productId}) {
		const query = {
			cart_userId: userId,
			cart_state: 'active'
		};

		// Check the current value of cart_count_product
		const existingCart = await cart.findOne(query).lean();

		if (!existingCart) {
			throw new NotFoundError('Cart not found for the user');
		}

		if (existingCart.cart_count_product <= 0) {
			throw new BadRequestError('Cannot decrease cart_count_product below 0');
		}

		// If cart_count_product > 0, proceed to update
		const updateSet = {
			$pull: {
				cart_products: {
					productId
				}
			},
			$inc: {
				cart_count_product: -1
			}
		};

		const options = { upsert: true, new: true };

		return await cart.findOneAndUpdate(query, updateSet, options);
	}

	static async getListUserCart({userId}) {
		return await cart.findOne({cart_userId: userId}).lean();
	}
}

module.exports = CartService
