const mongoose = require('mongoose');
const os = require('os');
const process = require('process');

const _SECOND = 5000;

// Count connections
const countConnect = () => {
	const numConnections = mongoose.connections.length;

	return numConnections;
}

// Check overload
const checkOverload = () => {
	setInterval(() => {
		const numConnections = countConnect();
		const numCpus = os.cpus().length;
		const memoryUsage = process.memoryUsage().rss / 1024 / 1024;

		const maxConnections = numCpus * 5;

		if(numConnections > maxConnections) {
			console.log(`Overload: ${numConnections} > ${maxConnections}`);
			console.log(`Memory usage: ${memoryUsage} MB`);
			console.log(`Number of CPUs: ${numCpus}`);
			console.log(`Number of connections: ${numConnections}`);
			console.log(`Number of connections per CPU: ${numConnections / numCpus}`);
			console.log(`Memory usage per connection: ${memoryUsage / numConnections} MB`);
		}
	}, _SECOND);
}

module.exports = {
	countConnect,
	checkOverload
};