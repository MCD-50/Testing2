import baseMongoRepository from "./baseMongoRepository";

class CoinRepository extends baseMongoRepository {
	constructor() {
		super("coin");
	}
}

const coinRepository = new CoinRepository();
export default coinRepository;
