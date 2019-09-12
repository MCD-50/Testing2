const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
// const exec = require("child_process").exec;
// const keythereum = require("keythereum");

const kue = require("kue");
const kueUI = require("kue-ui-express");


const redis = require("redis");

// import async from "async";
import redisHelper from "./app/helper/redisHelper";
import initWorker from "./app/worker/initWorker";

// import appFactoryHelper from "./app/helper/appFactoryHelper";


// import web3Client from "./app/client/web3Client";

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

	// now run the queries and show results

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
		//.on("job error", (exe) => console.log("KUE ERROR", "Error in automatic kue", { error: "Error in automatic kue" }, exe))
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
	kue.Job.rangeByState("active", 0, 30000, "asc", function (err, jobs) {
		for (let _job of jobs) _job.inactive();
	});


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
		setTimeout(async () => {
			kueClient.watchStuckJobs();



			// const db = appFactoryHelper.resolveInstance("coin");

			// const allCurrencies = Object.keys(constant.coins).concat("ETH");
			// // [ 'ETH', 'ADI', 'WTC', 'BNT', 'LALA', 'PAY', 'WISH', 'VZT', 'PGTS', 'PRIX', 'XNK', 'NPXS', 'BWT', 'GUSD', 'SUB', 'POE', 'OMG', 'CVC', 'SURE', 'HGT', 'PASS', 'TUSD', 'USDC', 'GAT', 'IND', 'ENJ', 'KNC', 'FXT', 'GVT', 'LTO', 'MRK', 'CFT', 'BLZ', 'CRED', 'SPIKE', 'COSS', 'SNM', 'DRGN', 'QNT', 'UBC', 'LINK', 'FDX', 'UFR', 'AGI', 'MANA', 'KICK', 'UBT', 'COS', 'XDCE', 'DAI', 'ETHOS', 'CS', 'MORE', 'TIG', 'LA', 'MKR', 'CELT', 'BAT', 'DAT', 'LEO', 'JET', 'MCO', 'LRC', 'REQ', 'STORJ', 'H2O', 'FRV', 'TAAS', 'MOD', 'SMDX', 'TEU', 'DDF', 'CAN', 'FYN', 'ITT', 'KIN', 'LAN', 'NOX', 'PGT', 'PIX', 'SENC', 'STX', 'TRAK', 'OPQ', 'VEN', 'QTUM', 'EOS', 'ICX' ]

			// //console.log(Object.keys(constant.PRICES).length, allCurrencies.length);

			// const t = allCurrencies.map(key => {
			// 	return async function (callback) {
			// 		// var coinKey = { "key": key + "Amount" };
			// 		var coinKey = key + "Amount";


			// 		const price = constant.PRICES[key];

			// 		exec(`mongodump --db settlement --collection ${coinKey}`, (error, stdout, stderr) => {
			// 			console.log(stdout);
			// 			console.log(stderr);
			// 			if (error !== null) {
			// 				console.log(`exec error: ${error}`);
			// 			}

			// 			callback(null, null);
			// 		});

			// 		// TAAS (2), DDF (1)(2), CAN (1)(2) 

			// 		// // get instance
			// 		var coll = app.mongoClient.connection.collection(coinKey);
			// 		var stream = coll.find().stream();

			// 		stream.on("data", function (doc) {
			// 			coll.update({ _id: doc._id },
			// 				{ $set: { usd: Number(Number(doc.value) * Number(price)) } }
			// 			);
			// 		});
			// 		stream.on("error", function (err) {
			// 			console.log(err);
			// 		});
			// 		stream.on("end", function () {
			// 			console.log(coinKey);
			// 			callback(null, null);
			// 		});



			// 		db.aggregate(
			// 			[
			// 				{ $match: { [coinKey]: { $gt: 0 } } },
			// 				{ $group: { _id: null, total: { $sum: "$" + coinKey } } }
			// 			],
			// 			(error, value) => {
			// 				console.log(coinKey, value);
			// 				callback(null, { error, value });
			// 			}).allowDiskUse(true);

			// 		var o = {};

			// 		o.map = function () {
			// 			emit(this.accountAddress, this[coinKey.key]);
			// 		};

			// 		o.reduce = function (k, vals) {
			// 			return vals;
			// 		};

			// 		o.out = {
			// 			replace: coinKey.key
			// 		};

			// 		o.scope = {
			// 			coinKey: coinKey,
			// 		};

			// 		o.query = {
			// 			[coinKey.key]: { $gt: 0 },
			// 			fetched: true
			// 		};

			// 		db.mapReduce(o, function (err, model, stats) {
			// 			console.log(err, model);
			// 			// model.find({}).exec((err, docs) => {
			// 			// 	console.log(err, docs);
			// 			// });
			// 			callback(null, null);
			// 		});
			// 	};
			// });


			// async.series(t, (error, results) => {
			// 	console.log(error, results);
			// });

			initWorker(app);
		}, 5 * 1000);
	});
});

mongoose.connection.on("error", (err) => {
	console.log("Could not connect to mongo server!");
	return console.log(err);
});