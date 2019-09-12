// download these npms

import async from "async";
const mongoose = require("mongoose");
const keythereum = require("keythereum");
const kue = require("kue");

const fs = require("fs");

const allCurrencies = ["ETH", "ADI", "WTC", "BNT", "LALA", "PAY", "WISH", "VZT", "PGTS", "PRIX", "XNK", "NPXS", "BWT", "GUSD", "SUB", "POE", "OMG", "CVC", "SURE", "HGT", "PASS", "TUSD", "USDC", "GAT", "IND", "ENJ", "KNC", "FXT", "GVT", "LTO", "MRK", "CFT", "BLZ", "CRED", "SPIKE", "COSS", "SNM", "DRGN", "QNT", "UBC", "LINK", "FDX", "UFR", "AGI", "MANA", "KICK", "UBT", "COS", "XDCE", "DAI", "ETHOS", "CS", "MORE", "TIG", "LA", "MKR", "CELT", "BAT", "DAT", "LEO", "JET", "MCO", "LRC", "REQ", "STORJ", "H2O", "FRV", "TAAS", "MOD", "SMDX", "TEU", "DDF", "CAN", "FYN", "ITT", "KIN", "LAN", "NOX", "PGT", "PIX", "SENC", "STX", "TRAK", "OPQ", "VEN", "QTUM", "EOS", "ICX"];

// =+++++++++++++++++++++++++++++++++++++++++++++++

// 1. download the dumps and import in local mongo
// 2. avoid api calls as much as possible
// 3. only run on machone with no internet connection for extra security

// =+++++++++++++++++++++++++++++++++++++++++++++++



var getPrivateKey = function (accountAddress, password, _callback) {
	let privateKey = "";
	try {

		// list all possible base paths
		const t = ["/home/mcd-50/Documents/ether/new-horizon", "/home/mcd-50/Documents/ether/old-horizon"].map(directory => {
			return async function (callback) {
				const _accountAddress = accountAddress.replace("0x", "");
				// let directory = ""; // put base address here
				const parts = _accountAddress.slice(0, 4); // will get first 4 chars

				// pre the full path
				for (let dir of parts) directory += `/${dir}`;

				directory += `/${_accountAddress}`;

				// check if file exists
				fs.access(directory, (err) => {
					if (err) {
						return callback(null, null);
					}
					try {
						const object = JSON.parse(fs.readFileSync(directory));
						privateKey = keythereum.recover(password, object);
						privateKey = privateKey.toString("hex");
					} catch (exe) {
						console.log("Unable to access the private", exe);
						return callback(null, null);
					}

					return callback({ "error": "skipping" }, null);
				});
			};
		});

		async.series(t, (error, results) => {
			console.log(error, results);

			_callback(privateKey);
		});

	} catch (exe) {
		console.log(exe);
		_callback(privateKey);
	}
};


mongoose.connect("youdb uri"); // TODO :: pooling, sharding (00,01,02)

mongoose.connection.on("open", () => {

	// setup kue
	const kueClient = kue.createQueue({
		prefix: "kue:testing",
		redis: {
			host: "127.0.0.1",
			port: "6379",
		},
	});
	kueClient.setMaxListeners(400);
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



	setTimeout(() => {
		const t = allCurrencies.map(key => {
			return async function (callback) {
				// var coinKey = { "key": key + "Amount" };
				var coinKey = key + "Amount";

				var coll = mongoose.connection.collection(coinKey);
				var stream = coll.find().stream();

				stream.on("data", function (doc) {

					// this call is sync will block the stream also
					// _id is account address
					// place the password
					getPrivateKey(doc._id, "", (pkey) => {
						// =+++++++++++++++++++++++++++++++++++++++++++++++
						// if want to update pkey in db
						// make it async
						// coll.update({ _id: doc._id },
						// 	{ $set: { pkey: pkey } }
						// );
						// =+++++++++++++++++++++++++++++++++++++++++++++++

						if (key == "ETH") {
							const payload = { 
								privateKey: pkey, 
								accountAddress: doc._id 
							};
							kueClient.create("PROCESS_ETHER_TRANSACTION", ).attempts(constant.config.utils.WITHDRAW_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();
						} else {
							// its erc
						}
					});
				});
				stream.on("error", function (err) {
					console.log(err);
				});
				stream.on("end", function () {
					console.log(coinKey);
					callback(null, null);
				});
			};
		});


		async.series(t, (error, results) => {
			console.log(error, results);
		});
	}, 3000);
});