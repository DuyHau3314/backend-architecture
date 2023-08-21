const mongoose = require('mongoose');
const { countConnect } = require('../helpers/check.connect');

class Database {

	constructor() {
		this.connect();
	}

	connect(type = 'mongodb') {
		if(1 === 1) {
			mongoose.set('debug', true);
			mongoose.set('debug', { color: true })
		}
		mongoose.connect('mongodb://127.0.0.1:27017/shopDEV')
		.then(() => {
				console.log('Database connection successful', countConnect())
			})
			.catch(err => {
				console.error('Database connection error', err);
			})
	}

	static getInstance() {
		if(!Database.instance) {
			Database.instance = new Database();
		}

		return Database.instance;
	}
}

const db = Database.getInstance();

module.exports = db;
