const redis = require('redis');
const {promisify} = require('util');
const { reservationInventory } = require('../models/repository/inventory.repo');
const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
	const key = `lock_v2023_:${productId}`;
	const retryTimes = 10;
	const expireTime = 3000; //3s

	for(let i = 0; i < retryTimes; i++) {
		const lock = await setnxAsync(key, cartId);
		if(lock) {
			const isReservation = await reservationInventory({productId, quantity, cartId});

			if(isReservation.modifiedCount) {
				await pexpire(key, expireTime);
				return lock;
			}
			return null;
		}
		await new Promise(resolve => setTimeout(resolve, 300));
	}
}

const releaseLock = async (keyLock) => {
	const deleteAsyncKey = promisify(redisClient.del).bind(redisClient);
	await deleteAsyncKey(keyLock);
}

module.exports = {
	acquireLock,
	releaseLock
}