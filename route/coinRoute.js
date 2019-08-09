import * as constant from "../app/helper/constant";

//import target resolver path
export const routePath = require("path").join(__dirname, "../app/controllers/coinController");

export const routes = [
	// query
	{ method: "get", endPoint: "fetchCoin@fetchCoin", routePrefix: constant.config.utils.routePrefix, noMiddleware: true }
];
