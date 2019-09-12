// import coinWorker from "./coinWorker";
import transactionWorker from "./transactionWorker";

const initWorker = (app) => {
	// coinWorker(app);
	transactionWorker(app);
};

export default initWorker;
