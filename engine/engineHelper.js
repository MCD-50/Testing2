const fs = require("fs");

import * as collection from "../app/common/collection";
import * as constant from "../app/helper/constant";

// middleware
import * as noMiddleware from "../middleware/noMiddleware";


//import all .js files in current folder and ignores index.js and any folder
const engineImport = (app, folderPath, isRoute = false) => {
	return new Promise(async (resolve) => {
		// get all acceptable files
		const files = fs.readdirSync(folderPath).filter(x => !x.includes("index.js") && !x.includes("engineHelper.js")).filter(x => x.includes(".js"));

		// resolve all promises
		const promises = files.map(async (file) => resolvePath(app, file, folderPath, isRoute));

		// resolve when all finished
		Promise.all(promises).then(() => resolve());
	});
};

const resolvePath = (app, file, folderPath, isRoute) => {
	return new Promise(async (resolve) => {
		const filePath = collection.getFileUrl(folderPath, file);

		// resolve if directory
		if (require("fs").statSync(filePath).isDirectory()) {
			return resolve(1);
		}

		// import schema if not route
		if (!isRoute) {
			require(filePath).default(app);
			return resolve(1);
		}

		// import and setup routes
		const fileInstance = require(filePath);

		const routes = fileInstance.routes;

		// take route path and convert it to a controller path
		const controllerPath = require(fileInstance.routePath);

		// no routes found
		if (!routes || routes.length < 0) {
			return resolve(1);
		}

		for (let route of routes) {
			const parts = route.endPoint.split("@");

			const handerValue = parts[0];
			const patternValue = parts[1];
			const routePrefix = route.routePrefix || constant.config.utils.routePrefix;

			// push default middleware
			const middleware = [noMiddleware.requestCheck];

			const method = route.method;
			const pattern = routePrefix + "/" + patternValue;
			const handler = controllerPath[handerValue];

			app[method](pattern, middleware, handler);

			// log the routes
			console.log("ROUTES", `${method} => ${pattern}`);
		}

		// resolve if things are correct
		return resolve(1);
	});
};

export default engineImport;
