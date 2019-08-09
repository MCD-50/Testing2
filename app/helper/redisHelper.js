
class RedisHelper {
	constructor(redisClient) {
		this.redisClient = redisClient;
	}

	exists(key) {
		return new Promise((resolve) => this.redisClient.exists(key, (error, response) => this.resolveResponse(error, response, resolve)));
	}
	
	// pass -ve value to decrement
	incrbyfloat(key, value) {
		return new Promise((resolve) => this.redisClient.incrbyfloat(key, value, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	hmset(hash, key, jsonString) {
		return new Promise((resolve) => this.redisClient.hmset(hash, key, jsonString, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	hmget(hash, keys) {
		return new Promise((resolve) => this.redisClient.hmget(hash, keys, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	hget(hash, key) {
		return new Promise((resolve) => this.redisClient.hget(hash, key, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	hdel(hash, key) {
		return new Promise((resolve) => this.redisClient.hdel(hash, key, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	hgetall(hash) {
		return new Promise((resolve) => this.redisClient.hgetall(hash, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	set(key, value) {
		return new Promise((resolve) => this.redisClient.set(key, value, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	setnx(key, value) {
		return new Promise((resolve) => this.redisClient.setnx(key, value, (error, response) => response == 1 ? this.resolveResponse(error, response, resolve) : this.resolveResponse("Unable to aquire lock", null, resolve)));
	}

	get(key) {
		return new Promise((resolve) => this.redisClient.get(key, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	del(key) {
		return new Promise((resolve) => this.redisClient.del(key, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	expire(key, time) {
		return new Promise((resolve) => this.redisClient.expire(key, time, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	expireat(key, time) {
		return new Promise((resolve) => this.redisClient.expireat(key, time, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	persist(key) {
		return new Promise((resolve) => this.redisClient.persist(key, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	rpush(key, value) {
		return new Promise((resolve) => this.redisClient.rpush(key, value, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	lpush(key, value) {
		return new Promise((resolve) => this.redisClient.lpush(key, value, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	lpop(key) {
		return new Promise((resolve) => this.redisClient.lpop(key, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	lrange(key, start, end) {
		return new Promise((resolve) => this.redisClient.lrange(key, start, end, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	ltrim(key, start, end) {
		return new Promise((resolve) => this.redisClient.ltrim(key, start, end, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	publish(key, value) {
		return new Promise((resolve) => this.redisClient.publish(key, value, (error, response) => this.resolveResponse(error, response, resolve)));
	}

	multi(ops) {
		return new Promise((resolve) => this.redisClient.multi(ops).exec((error, response) => this.resolveResponse(error, response, resolve)));
	}

	resolveResponse(error, response, callback) {
		try {
			if (error) {
				console.log(error);
				return callback({ error: "Redis error" });
			}
			// here values might be null in case if that doesn't exists || thats not a error handle at code level
			else return callback({ value: response });
		} catch (exe) {
			console.log(exe);
			return callback({ error: "Redis error" });
		}
	}
}


export default RedisHelper;