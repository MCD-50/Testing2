import * as transferService from "../service/transferService";

const initWorker = (app) => {
	transferService._startProcessing(app);

	app.kueClient.process("PROCESS_SWEEPING_TRANSACTION", 1, (job, done) => transferService._processSweepingTransaction(app, job, done));
	app.kueClient.process("FINALIZING_SWEEPING_TRANSACTION", 1, (job, done) => transferService._processSweepingTransaction(app, job, done));
};

export default initWorker;
