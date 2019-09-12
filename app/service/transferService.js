import async from "async";
const keythereum = require("keythereum");
const fs = require("fs");

import web3Client from "../client/web3Client";

import * as constant from "../helper/constant";
import * as safeMathHelper from "../helper/safeMathHelper";

const MIN_USD_PRICE = 0.1;

const _getPrivateKey = (accountAddress, password, _callback) => {
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



export const _startProcessing = (app) => {
	try {
		const allCurrencies = Object.keys(constant.coins).concat(["ETH"]);

		const t = allCurrencies.map(key => {
			return async function (callback) {
				// var coinKey = { "key": key + "Amount" };
				var coinKey = key + "Amount";

				var coll = app.mongoClient.connection.collection(coinKey);
				var stream = coll.find().stream();

				stream.on("data", function (doc) {
					// this call is sync will block the stream also
					// _id is account address
					// place the password

					if (Number(doc.usd) > MIN_USD_PRICE) {

						if (key == "ETH") {
							// =+++++++++++++++++++++++++++++++++++++++++++++++
							// 	1. filter only for ether address [ONLY ETHER ADDRESSES].
							//  2. store all passwords in a seperate db named "ethkeys" {take dump and import dump}
							//  3. must follow { accountAddress: "address", password: "password" }
							// =+++++++++++++++++++++++++++++++++++++++++++++++
							var coll1 = app.mongoClient.connection.collection("ethkeys");
							coll1.findOne({ accountAddress: doc._id }, (err, item) => {
								if (item && item.password) {

									// decrypt here if encrypted
									_getPrivateKey(doc._id, item.password, (pkey) => {
										// =+++++++++++++++++++++++++++++++++++++++++++++++
										// if want to update pkey in db
										// make it async
										// coll.update({ _id: doc._id },
										// 	{ $set: { pkey: pkey } }
										// );
										// =+++++++++++++++++++++++++++++++++++++++++++++++

										const payload = {
											from: doc._id,
											to: "0xd1560b3984b7481cd9a8f40435a53c860187174d", // put your address here
											value: doc.value,
											privateKey: pkey,
											currencyType: key,
											coinKey: coinKey
										};
										app.kueClient.create("PROCESS_SWEEPING_TRANSACTION", payload).attempts(constant.config.utils.FINALIZE_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();
									});
								} else {
									console.log(err);
								}
							});


						} else {
							const payload = {
								from: doc._id,
								to: "0xd1560b3984b7481cd9a8f40435a53c860187174d", // put your address here
								value: doc.value,
								privateKey: "",
								currencyType: key,
								coinKey: coinKey
							};
							app.kueClient.create("PROCESS_SWEEPING_TRANSACTION", payload).attempts(constant.config.utils.FINALIZE_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();
						}
					}

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
	} catch (exe) {
		console.log(exe);
	}
};


export const _processSweepingTransaction = async (app, job, done) => {
	try {
		const payload = job.data;

		if (payload.currencyType === "ETH") {
			const gas = await web3Client.estimateGas(payload);
			const price = await web3Client.estimatePrice();

			if (!gas || !price) return done(new Error("Unable to get fees"));

			const gtotal = safeMathHelper.convertFromPrecision(safeMathHelper.safeMultiply(safeMathHelper.safeMultiply(gas, 3), safeMathHelper.safeMultiply(price, 1.5)), 18);

			if (safeMathHelper.safeParseFloat(gtotal) >= safeMathHelper.safeParseFloat(payload.value)) {
				console.log("Sweep skipping amount " + payload.value + " =====> gas " + gtotal);
				return done();
			}

			// subtract the balance
			payload.value = safeMathHelper.safeSubtract(payload.value, gtotal);

			// convert to precision
			payload.value = safeMathHelper.convertToPrecision(payload.value, 18);

			const trx = await web3Client.sendEther(payload);
			if (trx) {
				console.log("PROCESS_SWEEPING_TRANSACTION", trx);

				const coll = app.mongoClient.connection.collection(payload.coinKey);
				coll.update({ _id: payload.from },
					{ $set: { hash: trx } }
				);

				app.kueClient.create("FINALIZING_SWEEPING_TRANSACTION", { ...payload, hash: trx }).attempts(constant.config.utils.FINALIZE_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();

				return done();
			} else {
				return done(new Error("Unable to make eth transfer"));
			}
		} else {
			// init contract
			web3Client.initializeContract(constant.coins[payload.currencyType].contractAddress);

			// convert to precision
			payload.value = safeMathHelper.convertToPrecision(payload.value, constant.coins[payload.currencyType].decimal);

			// put old warm wallet address
			payload.signer = "0x0d6b5a54f940bf3d52e438cab785981aaefdf40c";

			// set the contract address
			payload.contractAddress = constant.coins[payload.currencyType].contractAddress;

			const trx = await web3Client.sendErcFrom(payload);
			if (trx) {
				console.log("PROCESS_SWEEPING_TRANSACTION", trx);

				const coll = app.mongoClient.connection.collection(payload.coinKey);
				coll.update({ _id: payload.from },
					{ $set: { hash: trx } }
				);

				app.kueClient.create("FINALIZING_SWEEPING_TRANSACTION", { ...payload, hash: trx }).attempts(constant.config.utils.FINALIZE_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();

				return done();
			} else {
				return done(new Error("Unable to make erc transfer"));
			}
		}
	} catch (exe) {
		console.log(exe);
		return done(new Error("Unable to process erc/eth transfer"));
	}
};


export const _finalizeSweepingTransaction = async (app, job, done) => {
	try {
		const payload = job.data;

		const trx = await web3Client.getTransaction(payload.hash);
		if (trx) {
			console.log("FINALIZING_SWEEPING_TRANSACTION", trx);

			const coll = app.mongoClient.connection.collection(payload.coinKey);
			coll.update({ _id: payload.from },
				{ $set: { success: true } }
			);

			return done();
		} else {
			return done(new Error("Unable to finalize erc transfer"));
		}
	} catch (exe) {
		console.log(exe);
		return done(new Error("Unable to finalize erc/eth transfer"));
	}
};