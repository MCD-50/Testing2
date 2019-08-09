const mongoose = require("mongoose");

import appFactoryHelper from "../app/helper/appFactoryHelper";

const schema = {
	accountAddress: {
		type: String,
		unique: true,
	},
	currencyType: {
		type: String,
	},
	amount: {
		type: Number,
		default: 0
	},
	etherAmount: {
		type: Number,
		default: 0
	},
	privateKey: {
		type: String,
		default: ""
	},
	fetched: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
};

const initSchema = (app) => {
	const _schema = new mongoose.Schema(schema);
	// setup plugins
	_schema.plugin(require("./plugins/paging"));
	// setup indexes
	appFactoryHelper.addInstance("coin", app.mongoClient.model("coins", _schema));
};

export default initSchema;
