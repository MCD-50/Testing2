class AppFactoryHelper {
	constructor() {
		this.factory = {};
	}

	addInstance(key, instance) {
		this.factory[key] = instance;
	}

	removeInstance(key) {
		delete this.factory[key];
	}

	resolveInstance(key) {
		return this.factory[key];
	}
}

// init app factory
const appFactoryHelper = new AppFactoryHelper();
export default appFactoryHelper;
