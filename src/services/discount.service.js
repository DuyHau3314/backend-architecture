const { BadRequestError, NotFoundError } = require('../core/error/error.response');
const { discount } = require('../models/discount.model');
const { checkDiscountExists, findAllDiscountsCodesUnSelect } = require('../models/repository/discount.repo');
const { findAllProducts } = require('../models/repository/product.repo');
const { convertToObjectIdMongodb } = require('../utils');

/**
	Discount Service
	1. Generate Discount Code [Shop | Admin]
	2. Get discount amount [User]
	3. Get all discount codes [User | Shop]
	4. Verify discount code [User]
	5. Delete discount code [Shop | Admin]
	6. Cancel discount code [User]
 */

class DiscountService {
	static async createDiscountCode(payload) {
		const {
			code, start_date, end_date, is_active,
			shop_id, min_order_value, product_ids,
			applies_to, name, description, type, value,
			max_value, max_uses, uses_count, max_uses_per_user, users_used
		} = payload;

		// check valid date
		if(new Date(start_date) >= new Date(end_date)) {
			throw new BadRequestError('Start date must be before end date');
		}

		// create index for discount code
		const foundDiscount = await discount.findOne({
			discount_code: code,
			discount_shopId: convertToObjectIdMongodb(shop_id),
		}).lean();

		if(foundDiscount && foundDiscount.discount_is_active) {
			throw new BadRequestError('Discount code already exists');
		}

		const newDiscount = await discount.create({
			discount_name: name,
			discount_code: code,
			discount_description: description,
			discount_type: type,
			discount_value: value,
			discount_min_order_value: min_order_value || 0,
			discount_max_value: max_value || 0,
			discount_start_date: start_date,
			discount_end_date: end_date,
			discount_max_uses: max_uses || 0,
			discount_uses_count: uses_count || 0,
			discount_users_used: users_used,
			discount_shopId: convertToObjectIdMongodb(shop_id),
			discount_max_per_user: max_uses_per_user || 0,
			discount_is_active: is_active,
			discount_applies_to: applies_to,
			discount_product_ids: applies_to === 'all' ? [] : product_ids,
		});

		return newDiscount;
	}

	static async updateDiscountCode(payload) {}

	// Get all discount codes available with product
	static async getAllDiscountCodesWithProducts({
		code, shopId, userId, limit, page
	}) {
		const foundDiscount = await discount.findOne({
			discount_code: code,
			discount_shopId: convertToObjectIdMongodb(shopId),
		}).lean();

		if(!foundDiscount || !foundDiscount.discount_is_active) {
			throw new NotFoundError('Discount code not found');
		}

		const  { discount_applies_to, discount_product_ids } = foundDiscount;
		let products;
		if(discount_applies_to === 'all') {
			products = await findAllProducts({
				filter: {
					product_shop: convertToObjectIdMongodb(shopId),
					isPublished: true,
				},
				limit: +limit,
				page: +page,
				sort: 'ctime',
				select: ['product_name']
			})
		}

		if(discount_applies_to === 'specific') {
			products = await findAllProducts({
				filter: {
					product_shop: convertToObjectIdMongodb(shopId),
					isPublished: true,
					_id: {
						$in: discount_product_ids.map(id => convertToObjectIdMongodb(id))
					}
				},
				limit: +limit,
				page: +page,
				sort: 'ctime',
				select: ['product_name']
			})
		}

		return products;
	}

	// get all discount code of Shop
	static async getAllDiscountCodesByShop({
		shopId, limit, page
	}) {
		const discounts = await findAllDiscountsCodesUnSelect({
			limit: +limit,
			page: +page,
			filter: {
				discount_shopId: convertToObjectIdMongodb(shopId),
				discount_is_active: true,
			},
			unSelect: ['__v', 'discount_shopId'],
			model: discount,
		});

		return discounts;
	}

	// Apply discount code
	static async getDiscountAmount({ code, userId, shopId, products }){
		const foundDiscount = await checkDiscountExists({model: discount, filter: {
			discount_shopId: convertToObjectIdMongodb(shopId),
			discount_code: code,
		}})

		if(!foundDiscount) throw new NotFoundError('Discount code not found');

		const {
			discount_is_active,
			discount_max_uses,
			discount_start_date,
			discount_end_date,
			discount_min_order_value,
			discount_max_per_user,
			discount_users_used,
			discount_type,
			discount_value,
		} = foundDiscount;

		if(!discount_is_active) throw new BadRequestError('Discount code has expired');
		if(!discount_max_uses) throw new BadRequestError('Discount code has out of uses');

		if(new Date(discount_start_date) >= new Date(discount_end_date)) {
			throw new BadRequestError('Discount code has expired');
		}

		// check is have min order value or not
		let totalOrder = 0;
		if(discount_min_order_value > 0) {
			// get total
			totalOrder = products.reduce((total, product) => {
				return total + (product.quantity * product.price);
			}, 0);

			if(totalOrder < discount_min_order_value) throw new BadRequestError('Discount requires minimum order value');
		}

		if(discount_max_per_user > 0) {
			const foundUserUsed = discount_users_used.find(user => user._id === userId);

			if(foundUserUsed && foundUserUsed.count >= discount_max_per_user) {
				throw new BadRequestError('Discount code has out of uses');
			}
		}

		// check discount type is percentage or fix amount
		const amount = discount_type === 'fixed_amount' ? discount_value : (totalOrder * discount_value) / 100;

		return {
			totalOrder,
			discount: amount,
			totalPrice: totalOrder - amount,
		}
	}

	static async deleteDiscountCode({ code, shopId }) {
		const deleted = await discount.findOneAndDelete({
			discount_shopId: convertToObjectIdMongodb(shopId),
			discount_code: code,
		})

		return deleted;
	}

	// Cancel Discount Code
	static async cancelDiscountCode({ code, userId, shopId }) {
		const foundDiscount = await checkDiscountExists({model: discount, filter: {
			discount_shopId: convertToObjectIdMongodb(shopId),
			discount_code: code,
		}})

		if(!foundDiscount) throw new NotFoundError('Discount code not found');

		const result = await discount.findByIdAndUpdate(foundDiscount._id, {
			$pull: {
				discount_users_used: userId,
			},
			$inc: {
				discount_uses_count: -1,
				discount_max_uses: 1,
			}
		});

		return result;
	}
}

module.exports = DiscountService;