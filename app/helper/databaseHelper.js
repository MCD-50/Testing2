import moment from "moment";

import * as constant from "./constant";

// payload helper for all the dbs
export const mongooseBeautifyPaging = (payload) => {
	const paging = {};
	try {
		paging.page = payload.page || 1;
		paging.limit = payload.limit || 10;

		// if sort is an object then process
		if (typeof payload.sort == "object") {
			const sortObject = payload.sort;
			const keys = Object.keys(sortObject);
			if (keys.length > 0) {
				const key = keys[0];
				if (parseInt(Number(sortObject[key])) == 1 || parseInt(Number(sortObject[key])) == -1) paging["sort"] = { [key]: parseInt(Number(sortObject[key])) };
			}
		}
		else if (payload.sort == "+1" || payload.sort == "-1") paging["sort"] = { _id: parseInt(Number(payload.sort)) };
		else paging["sort"] = { createdAt: -1 };
	} catch (exe) {
		paging.page = 1;
		paging.limit = 10;
		paging["sort"] = { createdAt: -1 };
	}

	return { ...paging };
};


export const moongooseBeautifyFilter = (payload) => {
	const filter = {};

	try {
		const keys = Object.keys(payload);
		for (let key of keys) {
			const value = payload[key];
			if (Array.isArray(value)) filter["$or"] = value.map(item => ({ [key]: item }));
			else if (typeof value == "object") {
				// check if key is allowed of not
				for (let operation of Object.keys(value)) {
					if (constant.ALLOWED_OPERATIONS.includes(operation)) filter[operation] = { [key]: value[operation] };
				}
			} else if (typeof value == "boolean" || typeof value == "string" || typeof value == "number") filter[key] = value;
		}
	} catch (exe) {
		console.log(exe);
	}

	return { ...filter };
};


// for sanitizing the payload
export const getSanitizedUpdatePayload = (payload) => {
	const _payload = Object.keys(payload).reduce((previousValue, currentKey) => {
		if (!constant.NOT_ALLOWED_UPDATE_FIELDS.includes(currentKey)) {
			previousValue[currentKey] = payload[currentKey];
		}
		return previousValue;
	}, {});

	return _payload;
};


// for db callback

export const moongooseCallback = (payload, resolve) => {
	if (payload.error) {
		console.log(payload.error, payload.error.writeErrors);
		// return the error in callback
		resolve({ error: "Something went wrong" });
	}
	else if (!payload.value) resolve({ value: null });
	else if (payload.action == "list_with_page" && payload.value && payload.value.rows) {
		const result = payload.value;
		const value = {};
		value["data"] = result["rows"].slice() || [];
		value["count"] = result["count"];
		// return the list in callback
		resolve({ value });
	} else if (payload.action == "list_without_page" && payload.value) {
		resolve({ value: payload.value });
	} else if ((payload.action == "delete" || payload.action == "create" || payload.action == "create_multi") && payload.value) {
		if (payload.action == "delete" || payload.action == "create_multi") return resolve({ value: true });

		// for create return the created item
		return resolve({ value: payload.value[0] });
	} else if (payload.value) {
		resolve({ value: payload.value });
	} else {
		resolve({ error: "Something went wrong." });
	}
};

export const moongooseBuildQueryFromPayload = (payload) => {
	const query = {};

	const start = payload.start && moment(Number(payload.start)).toDate();
	const end = payload.end && moment(Number(payload.end)).toDate();

	if (start && end) {
		query["$and"] = [
			{ createdAt: { "$gte": start.toISOString() } },
			{ createdAt: { "$lte": end.toISOString() } },
		];
	}

	if (payload.customerId) query["customerId"] = payload.customerId;
	if (payload.currencyType) query["currencyType"] = payload.currencyType;
	if (payload.status) query["status"] = payload.status;
	if (payload.type) query["type"] = payload.type;
	if (payload.ipAddress) query["ipAddress"] = payload.ipAddress;
	if (payload.requestUrl) query["requestUrl"] = payload.requestUrl;
	if (payload.appName) query["appName"] = payload.appName;

	return query;
};
