const { OK } = require("../core/success/success.response");
const ProductFactory = require("../services/product.service");
const ProductFactoryV2 = require("../services/product.service.xxx");


class ProductController {
	createProduct = async (req, res, next) => {
		return new OK({
			message: 'Create product success!',
			metadata: await ProductFactoryV2.createProduct(req.body.product_type, {
				...req.body,
				product_shop: req.user.userId,
			}),
		}).send(res);
	}
}

module.exports = new ProductController();