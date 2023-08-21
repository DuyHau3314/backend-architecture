const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const app = express();

// Init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

// Init db
require('./dbs/init.mongodb');
const { checkOverload } = require('./helpers/check.connect')
checkOverload();

// Init routes
app.get('/', (req, res, next) => {
	res.status(200).json({
		message: 'Hello World',
		metadata: 'hi'.repeat(100000)
	});
})

// Handle Error

module.exports = app;