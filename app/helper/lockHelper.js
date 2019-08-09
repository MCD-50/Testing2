import * as collection from "../common/collection";

class LockHelper {
	createLock(distributedLock, key, ttl = 15000) {
		return new Promise(async (resolve) => {
			if (!key.includes("REDLOCK_LAUNCHER")) key = collection.prepareRedisKey("REDLOCK_LAUNCHER", key);

			distributedLock.lock(key, ttl, (err, lock) => {
				if (err) {
					// we weren't able to reach redis; your lock will eventually
					// expire, but you probably want to log this error
					console.log(err);
					return resolve({ error: "Unable to get lock" });
				} else {
					return resolve({ value: lock });
				}
			});
		});
	}

	releaseLock(lock) {
		return new Promise(async (resolve) => {
			lock && lock.unlock((err) => {
				if (err) {
					// we weren't able to reach redis; your lock will eventually
					// expire, but you probably want to log this error
					this.releaseLockRecursive(lock);
					console.log(err);
					return resolve({ error: true });
				} else {
					return resolve({ value: true });
				}
			});

		});
	}

	// internal method
	releaseLockRecursive(lock, count = 3) {
		if (count < 3) {
			lock && lock.unlock((err) => {
				if (err) {
					// we weren't able to reach redis; your lock will eventually
					// expire, but you probably want to log this error
					console.log(err);
					return this.releaseLockRecursive(lock, count++);
				}
			});
		}

		console.log("Unable to release lock failed, count = " + count, lock.resource);
		return null;
	}

	// used to extend lock
	extendLock(lock, extendTtl = 15000) {
		return new Promise(async (resolve) => {
			lock && lock.extend(extendTtl, (err, lock) => {
				if (err) {
					// we weren't able to reach redis; your lock will eventually
					// expire, but you probably want to log this error
					console.log(err);
					return resolve({ err: true });
				} else {
					return resolve({ value: lock });
				}
			});
		});
	}
}

const lockHelper = new LockHelper();
export default lockHelper;