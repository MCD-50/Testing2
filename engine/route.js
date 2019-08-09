const routePath = require("path").join(__dirname, "../route");

import engineImport from "./engineHelper";

const route = async (app) => {
	// make it sync
	await engineImport(app, routePath, true);
};

export default route;