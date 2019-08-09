import uuid from "uuid/v1";
import moment from "moment";
import randomstring from "randomstring";

// logging helper for new requests
export const logRequest = (req, res, next) => {
	let ip = "Unknown";
	try {
		ip = req.headers && req.headers["x-forwarded-for"] && req.headers["x-forwarded-for"].split(",").pop() || req.connection && req.connection.remoteAddress || req.socket && req.socket.remoteAddress || req.connection && req.connection.socket && req.connection.socket.remoteAddress;
	} catch (exe) {
		// fail silently
	}

	req.headers["ip-address"] = ip || "Unknown";
	if (!req.originalUrl.includes("/kue-api") && req.method != "OPTIONS") {
		const start = moment().format("DD/MM/YY HH:mm:ss");
		console.log("REQUEST", `${start} => ${req.method} from ${req.originalUrl} where ip is ${ip}`);
		res.on("finish", () => {
			const end = moment().format("DD/MM/YY HH:mm:ss");
			console.log("REQUEST_FINISH", `${end} => ${res.statusCode} for ${req.originalUrl} having ${res.statusMessage}; ${res.get("Content-Length") || 0}b sent`);

			const _payload = {
				start: start,
				end: end,
				requestUrl: req.originalUrl || "",
				statusCode: res.statusCode || "",
				contentLength: res.get("Content-Length") || 0,
				...req.headers,
			};

			// push log if there consumer queue exists
			if (req.app && req.app.queueClient) req.app.queueClient.push(_payload);
		});
	}
	// pass middleware
	next();
};


// ----------------------
// HELPER
// ----------------------
// redis key utils
export const prepareRedisKey = (key, value, divider = "_") => (key + divider + value);
// format { epoch2 - epoch1 }
export const getMonthDiffBetweenDates = (start, end) => (Math.abs(end - start) / 36e5);
// format { ayushShukla => AYUSH_SHUKLA }
export const camelCaseToUpperCaseKey = (key) => key.replace(/([A-Z])/g, "_$1").replace(/^./, (str) => str.toUpperCase()).toUpperCase();
// charset => alphanumeric - [0-9 a-z A-Z] alphabetic - [a-z A-Z] numeric - [0-9] hex - [0-9 a-f] 
export const getSeed = (length = 32, charset = "hex") => randomstring.generate({ length: length, charset: charset, capitalization: "uppercase" });
// used to get uuid
export const getUUID = () => uuid();
// mark value of sesitive data before saving to db
export const maskValue = (value) => (value.length > 4 ? Array(value.length - 4).fill("*").join("") + value.substring(value.length - 4, value.length) : "****");
// format { base64 => base64Safe }
export const webSafe64 = (base64) => base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
// format { base64Safe => base64 }
export const normalizeWebSafe64 = (base64) => base64.replace(/\-/g, "+").replace(/_/g, "/") + "==".substring(0, (3 * base64.length) % 4);
// format special characters
export const removeSpecialCharacter = (value) => value.replace(/[^\w\s]/gi, "");
// get absolute file url
export const getFileUrl = (...args) => args.length > 1 ? args.join("/") : "./" + args;
export const nullErrorValidate = (item) => (!item || item.error || item.value == null);

export const validateEmail = (email) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
export const validateMobile = (mobile) => (/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{10}\s*,?$/.test(mobile));

// ----------------------
// JSON HELPER
// ----------------------
// get string from json object
export const getStringFromJson = (jsonData) => (typeof jsonData == "string" ? jsonData : JSON.stringify(jsonData));
// get json from the string object
export const getJsonFromString = (jsonString) => {
	try {
		//jsonString = passJsonCheck(jsonString);
		return JSON.parse(jsonString);
	} catch (exe) {
		// console.log("JSON PARSE", jsonString, exe);
	}
	return jsonString;
};
// removes few values from json string and validate
// export const passJsonCheck = (jsonString) => {
// 	try {
// 		jsonString = jsonString.replace(/(^')|('$)/g, "");
// 		jsonString = jsonString.replace(/(^")|("$)/g, "");
// 		return jsonString;
// 	}
// 	catch (exe) {
// 		return jsonString;
// 	}
// };



// ----------------------
// RESPONSE
// ----------------------
// middleware for changing the response structure if needed
export const getJsonResponse = (response) => ({ ...response });
// middleware for changing the error structure if needed
export const getJsonError = (error) => ({ ...error });