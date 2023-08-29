const { OK, CREATED } = require("../core/success/success.response");
const ProductFactory = require("../services/product.service");
const ProductFactoryV2 = require("../services/product.service.xxx");


class ProductController {
	createProduct = async (req, res, next) => {
		return new CREATED({
			message: 'Create product success!',
			metadata: await ProductFactoryV2.createProduct(req.body.product_type, {
				...req.body,
				product_shop: req.user.userId,
			}),
		}).send(res);
	}

	publishProductByShop = async (req, res, next) => {
		return new OK({
			message: 'Publish product success!',
			metadata: await ProductFactoryV2.publishProductByShop({
				product_shop: req.user.userId,
				product_id: req.params.id,
			}),
		}).send(res);
	}

	unpublishProductByShop = async (req, res, next) => {
		return new OK({
			message: 'Unpublish product success!',
			metadata: await ProductFactoryV2.unpublishProductByShop({
				product_shop: req.user.userId,
				product_id: req.params.id,
			})
		}).send(res);
	}

	getListSearchProducts = async (req, res, next) => {
		return new OK({
			message: 'Search products success!',
			metadata: await ProductFactoryV2.searchProducts(req.params),
		}).send(res);
	}

	/**
	 * @description Get all drafts for shop
	 * @param {Number} limit
	 * @param {Number} skip
	 * @returns { JSON }
	 */
	getAllDraftsForShop = async (req, res, next) => {
		return new OK({
			message: 'Get all products success!',
			metadata: await ProductFactoryV2.findAllDraftsForShop({
				product_shop: req.user.userId,
			}),
		}).send(res);
	}

	getAllPublishedForShop = async (req, res, next) => {
		return new OK({
			message: 'Get all products success!',
			metadata: await ProductFactoryV2.findAllPublishedForShop({
				product_shop: req.user.userId,
			}),
		}).send(res);
	}
}

module.exports = new ProductController();