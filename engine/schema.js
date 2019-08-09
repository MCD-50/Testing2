//get root folder
const schemaPath1 = require("path").join(__dirname, "../schemaMongo");

import engineImport from "./engineHelper";

const schema = async (app) => {
	await engineImport(app, schemaPath1);
};

export default schema;
