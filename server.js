const app = require('./src/app');

const PORT = 3055;

const server = app.listen(PORT, () => {
	console.log('WSV eCommerce is running on port 3055');
});
