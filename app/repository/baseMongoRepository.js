import * as constant from "../helper/constant";
import * as databaseHelper from "../helper/databaseHelper";

import appFactoryHelper from "../helper/appFactoryHelper";

class BaseRepository {
	constructor(database) {
		this.db = appFactoryHelper.resolveInstance(database);
		this.actualDbName = database;
		this.dbName = String(database).toUpperCase();
	}

	_createItem(payload, sessionOptions = null) {
		if (!this.db) this.db = appFactoryHelper.resolveInstance(this.actualDbName);
		sessionOptions = sessionOptions || {};
		return new Promise((resolve) => {
			this.db.create([payload], { ...sessionOptions }, (error, value) => databaseHelper.moongooseCallback({ dbName: this.dbName, action: "create", value: value, error: error }, resolve));
		});
	}

	_createItemMulti(payloads) {
		if (!this.db) this.db = appFactoryHelper.resolveInstance(this.actualDbName);
		return new Promise((resolve) => {
			this.db.insertMany(payloads, { ordered: false }, (error, value) => databaseHelper.moongooseCallback({ dbName: this.dbName, action: "create_multi", value: value, error: error }, resolve));
		});
	}

	_getItem(filter, keys = constant.DB_FETCH[this.actualDbName]) {
		if (!this.db) this.db = appFactoryHelper.resolveInstance(this.actualDbName);
		return new Promise((resolve) => {
			// we are not performing lean
			this.db.findOne(filter).select(keys).exec((error, value) => databaseHelper.moongooseCallback({ dbName: this.dbName, action: "get", value: value, error: error }, resolve));
		});
	}

	_saveItem(item, sessionOptions = null) {
		if (!this.db) this.db = appFactoryHelper.resolveInstance(this.actualDbName);
		sessionOptions = sessionOptions || {};
		return new Promise((resolve) => {
			item.save({ ...sessionOptions }, (error, value) => databaseHelper.moongooseCallback({ dbName: this.dbName, action: "update", value: value, error: error }, resolve));
		});
	}

	_updateItem(filter, payload) {
		if (!this.db) this.db = appFactoryHelper.resolveInstance(this.actualDbName);
		return new Promise((resolve) => {
			this.db.findOneAndUpdate(filter, payload, { new: true }, (error, value) => databaseHelper.moongooseCallback({ dbName: this.dbName, action: "update", value: value, error: error }, resolve));
		});
	}
	
	_deleteItem(filter) {
		if (!this.db) this.db = appFactoryHelper.resolveInstance(this.actualDbName);
		return new Promise((resolve) => {
			this.db.findOneAndDelete(filter, (error, value) => databaseHelper.moongooseCallback({ dbName: this.dbName, action: "delete", value: value, error: error }, resolve));
		});
	}
	
	// returns results without the paging
	_getAllItem(filter, keys = constant.DB_FETCH[this.actualDbName]) {
		if (!this.db) this.db = appFactoryHelper.resolveInstance(this.actualDbName);
		return new Promise((resolve) => {
			this.db.find(filter).select(keys).lean().exec((error, value) => databaseHelper.moongooseCallback({ dbName: this.dbName, action: "list_without_page", value: value, error: error }, resolve));
		});
	}

	_filterItem(filter, paging = null, keys = constant.DB_FETCH[this.actualDbName]) {
		if (!this.db) this.db = appFactoryHelper.resolveInstance(this.actualDbName);
		filter = databaseHelper.moongooseBeautifyFilter(filter);
		paging = databaseHelper.mongooseBeautifyPaging(paging);
		console.log(paging);
		return new Promise((resolve) => {
			this.db.paging({ filter, ...paging, keys }, (error, value) => databaseHelper.moongooseCallback({ dbName: this.dbName, action: "list_with_page", value: value, error: error }, resolve));
		});
	}
}

export default BaseRepository;