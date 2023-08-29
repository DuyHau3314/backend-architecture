const { BadRequestError } = require('../../core/error/error.response');
const {
    product,
    electronics,
    clothing,
    furniture,
} = require('../../models/product.model');

const findAllProductsForShop = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate('product_shop', 'name email -_id')
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundProduct = await product.findOne({
        _id: product_id,
        product_shop: product_shop,
    });

    if (!foundProduct) return null;

    foundProduct.isDraft = false;
    foundProduct.isPublished = true;

    const { modifiedCount } = await foundProduct.updateOne(foundProduct);

    return modifiedCount;
};

const unpublishProductByShop = async ({ product_shop, product_id }) => {
    const foundProduct = await product.findOne({
        _id: product_id,
        product_shop: product_shop,
    });

    if (!foundProduct) return null;

    foundProduct.isDraft = true;
    foundProduct.isPublished = false;

    const { modifiedCount } = await foundProduct.updateOne(foundProduct);

    return modifiedCount;
};

const searchProductByUser = async ({ limit, skip, keySearch }) => {
    const regexSearch = new RegExp(keySearch, 'i');

    const result = await product
        .find(
            {
                isPublished: false,
                $text: { $search: regexSearch },
            },
            {
                score: { $meta: 'textScore' },
            }
        )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

	return result;
};

module.exports = {
    findAllProductsForShop,
    publishProductByShop,
    unpublishProductByShop,
	searchProductByUser
};
