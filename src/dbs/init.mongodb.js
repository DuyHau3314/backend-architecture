const mongoose = require('mongoose');
const { countConnect } = require('../helpers/check.connect');
const config =  require('../configs/config.mongodb')

class Database {

	constructor() {
		console.log('config', config);
		this.connect();
	}

	connect(type = 'mongodb') {
		if(1 === 1) {
			mongoose.set('debug', true);
			mongoose.set('debug', { color: true })
		}
		mongoose.connect(`mongodb://${config.db.host}/${config.db.name}`)
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
