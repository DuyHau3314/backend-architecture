const _ = require('lodash');

const getInfoData = ({fields = [], object = {}}) => {
	return _.pick(object, fields);
}

// ['a', 'b', 'c'] => {a: 1, b: 1, c: 1}
const getSelectData = (select = []) => {
	return Object.fromEntries(select.map((item) => [item, 1]));
}

const getUnSelectData = (unselect = []) => {
	return Object.fromEntries(unselect.map((item) => [item, 0]));
}

const removeUndefinedObject = (object = {}) => {
	// remove undefined and null field ??
	Object.keys(object).forEach((key) => {
		if (object[key] === undefined || object[key] === null) {
			delete object[key];
		}
	})

	return object;
}

const updateNestedObjectParser = obj => {
	const result = {};
	for (const key in obj) {
		if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
			const nestedObj = updateNestedObjectParser(obj[key]);
			for (const nestedKey in nestedObj) {
				result[`${key}.${nestedKey}`] = nestedObj[nestedKey];
			}
		} else {
			result[key] = obj[key];
		}
	}
	return result;
}

module.exports = {
	getInfoData,
	getSelectData,
	getUnSelectData,
	removeUndefinedObject,
	updateNestedObjectParser
}