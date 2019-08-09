const events = require("events");

class EventHelper {
	constructor() {
		this.eventManager = {
			appEmitter: new events.EventEmitter()
		};
	}

	addInstance(key, instance) {
		this.eventManager[key] = instance;
	}

	removeInstance(key) {
		delete this.eventManager[key];
	}

	resolveInstance(key = "appEmitter") {
		return this.eventManager[key];
	}
}

const eventHelper = new EventHelper();
export default eventHelper;