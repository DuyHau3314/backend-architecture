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

module.exports = {
	getInfoData,
	getSelectData,
	getUnSelectData
}