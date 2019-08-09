const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const kue = require("kue");
const kueUI = require("kue-ui-express");

const redis = require("redis");

import redisHelper from "./app/helper/redisHelper";
import initWorker from "./app/worker/initWorker";

import * as constant from "./app/helper/constant";

const app = express();
const server = require("http").createServer(app);

app.redisClient = null;
app.mongoClient = null;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(require("path").join(__dirname, "public")));


//setup mongoose
mongoose.connect(constant.config.mongodb.uri, constant.config.options); // TODO :: pooling, sharding (00,01,02)

mongoose.connection.on("open", () => {
	console.log(constant.config.mongodb.uri);

	// set to mongoose
	app.mongoClient = mongoose;


	//setup redis
	const redisClient = redis.createClient(constant.config.redisConfig);
	redisClient.on("error", err => console.error.bind(console, err));
	redisClient.on("ready", async () => {
		app.redisClient = redisClient;
		const _redisHelper = new redisHelper(redisClient);
		app.redisHelper = _redisHelper;
	});


	// setup kue
	const kueClient = kue.createQueue(constant.config.kue);
	kueClient.setMaxListeners(400);
	app.kueClient = kueClient;
	kueClient
		// .on("job error", (exe) => console.log("KUE ERROR", "Error in automatic kue", { error: "Error in automatic kue" }, exe))
		.on("job enqueue", () => {
			// console.log("JOB COMPLETE", `Job ${id} got queued of type ${type}`);
		}).on("job complete", (id) => {
			kue.Job.get(id, (err, job) => {
				if (err) return;
				job.remove((err) => {
					if (err) return;
					console.log("JOB REMOVE", `Job ${id} got removed on complete`);
				});
			});
		}).on("job failed", (id) => {
			kue.Job.get(id, async (err, job) => {
				if (err) return;
				if (job._max_attempts > 0) {
					// get payload
					console.log("JOB FAIL", `Job of type ${job.type} with id ${id} has failed.`);
				}
			});
		});

	// active
	// failed
	// kue.Job.rangeByState("active", 0, 30000, "asc", function (err, jobs) {
	// 	for (let _job of jobs) _job.inactive();
	// });


	if (constant.config.environment == "development" || constant.config.environment == "staging") {
		kueUI(app, "/kue/", "/kue-api");
		app.use("/kue-api/", kue.app);
	}


	// enable routes
	require("./engine").default(app);

	// event emitter hack
	require("events").EventEmitter.prototype._maxListeners = 400;

	// setup the better queue
	// const queueClient = new queue((batch, done) => logService._createLog(app, batch, done), { batchSize: 500, batchDelay: 20000, });
	// app.queueClient = queueClient;

	// start server
	server.listen(constant.config.port, constant.config.host, async () => {
		console.log("APP", `Server running on port ${constant.config.port} and on host ${constant.config.host}.....`);
		process.on("unhandledRejection", (reason, promise) => {
			console.log("APP_ERROR", `Uncaught error in ${String(reason)}`, promise);
		});

		process.once("SIGTERM", () => {
			kueClient.shutdown(5000, (err) => {
				console.log("APP_ERROR", "Kue shutdown", err);
				process.exit(0);
			});
		});

		// init workers after 5 sec
		setTimeout(() => {
			kueClient.watchStuckJobs();
			initWorker(app);
		}, 5 * 1000);
	});
});

mongoose.connection.on("error", (err) => {
	console.log("Could not connect to mongo server!");
	return console.log(err);
});