const { BadRequestError } = require('../../core/error/error.response');
const {
    product,
    electronics,
    clothing,
    furniture,
} = require('../../models/product.model');
const { getSelectData, getUnSelectData } = require('../../utils');

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

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };

    const products = await product.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean().exec();

    return products;
}

const findProduct = async ({ product_id, unSelect }) => {
    const foundProduct = await product.findOne({ _id: product_id }).select(getUnSelectData(unSelect)).lean().exec();

    if (!foundProduct) throw new BadRequestError('Product not found');

    return foundProduct;
}

const updateProductById = async({product_id, payload, model, isNew = true}) => {
    return await model.findByIdAndUpdate(product_id, payload, { new: isNew }).lean().exec();
}

const  getProductById = async (productId) => {
    return await product.findById(productId).lean().exec();
}

const checkProductByServer = async (products) => {
    console.log("==========products", products);
    return await Promise.all(products.map(async (p) => {
        const foundProduct = await product.findById(p.product_id).lean().exec();

        if(foundProduct){
            return {
                price: foundProduct.product_price,
                quantity: product.quantity,
                productId: product.productId,
            }
        }

        return null;
    }))
}

module.exports = {
    findAllProductsForShop,
    publishProductByShop,
    unpublishProductByShop,
	searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer
};
