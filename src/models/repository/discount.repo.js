const { getUnSelectData, getSelectData } = require("../../utils");

const findAllDiscountsCodesUnSelect = async ({
	limit = 50, page = 1, sort = 'ctime', unSelect, model
}) => {
	const skip = (page - 1) * limit;
	const sortBy = sort === 'ctime' ? { _id: -1 } : { id: -1 };
	const documents = await model.find({}).sort(sortBy).skip(skip).limit(limit).select(getUnSelectData(unSelect)).lean();

	return documents;
}

const findAllDiscountsCodesSelect = async ({
	limit = 50, page = 1, sort = 'ctime', select, model, filter = {}
}) => {
	const skip = (page - 1) * limit;
	const sortBy = sort === 'ctime' ? { _id: -1 } : { id: -1 };
	const documents = await model.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean();

	return documents;
}

const checkDiscountExists = async ({model, filter}) => {
	return await model.findOne(filter).lean();
}

module.exports = {
	findAllDiscountsCodesUnSelect,
	findAllDiscountsCodesSelect,
	checkDiscountExists
}