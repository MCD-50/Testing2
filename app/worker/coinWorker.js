import * as coinService from "../service/coinService";

const initWorker = (app) => {
	coinService._readFromCsv(app);
	
	//app.kueClient.create("PROCESS_FROM_DB", { page: 30, limit: 1000 }).attempts(1).backoff({ delay: 20000, type: "fixed" }).save();
	
	// app.kueClient.process("ADD_TO_DB", 10, (job, done) => coinService._addToDb(app, job, done));
	// app.kueClient.process("PROCESS_FROM_DB", 1, (job, done) => coinService._processFromDb(app, job, done));
	app.kueClient.process("FETCH_NODE_DETAIL", 20, (job, done) => coinService._fetchNodeDetail(app, job, done));
};

export default initWorker;
