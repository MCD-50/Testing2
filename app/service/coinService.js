// import async from "async";

import * as pipeClient from "../client/pipeClient";
import web3Client from "../client/web3Client";

import * as constant from "../helper/constant";
import * as safeMathhelper from "../helper/safeMathHelper";


import coinRepository from "../repository/coinRepository";

export const _readFromCsv = async (app) => {
	try {
		// console.log(await web3Client.getBalance("0xd74dbeb8a6f9a1f23812b9fde2dde62621cc76ee"));

		const start = 0;
		const end = 100;

		// const data = await pipeClient.readFile();

		// if (data.value) {
		// 	let step = 5;

		// 	for (let i = 0; i < data.value.length; i = i + step) {
		// 		if (i < start) continue;
		// 		if (i > end) break;

		// 		const items = data.value.slice(i, i + step);
		// 		const payloads = items.map(x => {
		// 			return {
		// 				"accountAddress": x.reference,
		// 				"currencyType": x.code
		// 			};
		// 		});

		// 		app.kueClient.create("FETCH_NODE_DETAIL", payloads).attempts(constant.config.utils.FINALIZE_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();

		// 		// app.kueClient.create("ADD_TO_DB", payloads).attempts(constant.config.utils.WITHDRAW_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();
		// 		// for (let j = 0; j < payloads.length; j++) {
		// 		// 	app.kueClient.create("FETCH_NODE_DETAIL", payloads[j], { id: payloads[j].accountAddress }).attempts(constant.config.utils.FINALIZE_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();
		// 		// }
		// 	}
		// }


		pipeClient.readFile((val, index) => {

			const payloads = {
				"accountAddress": val.reference,
				"currencyType": val.code
			};

			if (index >= start && index <= end) {
				app.kueClient.create("FETCH_NODE_DETAIL", payloads, { id: payloads.accountAddress }).attempts(constant.config.utils.FINALIZE_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();
			}

			if ((index % 1000) == 0) console.log("Index ", index);
		});










		// if (data.value) {
		// 	let step = 1000;

		// 	for (let i = 0; i < data.value.length; i = i + step) {
		// 		const items = data.value.slice(i, i + step);
		// 		const payloads = items.map(x => {
		// 			return {
		// 				"accountAddress": x.reference,
		// 				"currencyType": x.code
		// 			};
		// 		});

		// 		// app.kueClient.create("ADD_TO_DB", payloads).attempts(constant.config.utils.WITHDRAW_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();
		// 		// for (let j = 0; j < payloads.length; j++) {
		// 		// 	app.kueClient.create("FETCH_NODE_DETAIL", payloads[j], { id: payloads[j].accountAddress }).attempts(constant.config.utils.FINALIZE_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();
		// 		// }
		// 	}
		// }
	} catch (exe) {
		console.log(exe);
	}
};

// export const _processFromDb = async (app, job, done) => {
// 	try {
// 		const payload = job.data;
// 		const items = await coinRepository._filterItem({}, { page: payload.page, limit: payload.limit });
// 		if (!items || items.error || !items.value) {
// 			return done(new Error("Something wronmg"));
// 		}

// 		const newPayload = { page: parseInt(payload.page) + 1, limit: parseInt(payload.limit) };

// 		for (let item of items.value.data) {
// 			// console.log(item._id, item.accountAddress, item.currencyType);
// 			app.kueClient.create("FETCH_NODE_DETAIL", { accountAddress: item.accountAddress, currencyType: item.currencyType }, { id: item._id.toString() }).attempts(constant.config.utils.WITHDRAW_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();
// 		}

// 		if (items.value.data.length < 1000) {
// 			return done();
// 		}

// 		setTimeout(() => {
// 			app.kueClient.create("PROCESS_FROM_DB", newPayload).attempts(constant.config.utils.WITHDRAW_ATTEMPT).backoff({ delay: constant.config.utils.BACK_OFF, type: "fixed" }).save();
// 		}, 10000);

// 		return done();
// 	} catch (exe) {
// 		console.log(exe);
// 	}
// };


export const _addToDb = async (app, job, done) => {
	try {
		const payload = job.data;

		const added = await coinRepository._createItemMulti(payload);

		if (!added || added.error || !added.value) return done(new Error("Unable to add to the db"));

		return done();

	} catch (exe) {
		console.log(exe);
		return done(new Error("Something wronmg"));
	}
};

export const _fetchNodeDetail = async (app, job, done) => {
	try {
		const payload = job.data;

		// for all non eth currencies
		if (payload.currencyType != "ETH" && (!constant.coins[payload.currencyType] || !constant.coins[payload.currencyType].contractAddress || !constant.coins[payload.currencyType].decimal)) {
			return done(new Error("Unable to get erc details"));
		}

		// const count = await web3Client.getTransactionCount(payload.accountAddress);
		// if (count == null) return done(new Error("Something wronmg. unable to get count value"));
		// if (count == 0) {
		// 	// not much important
		// 	await coinRepository._updateItem({ accountAddress: payload.accountAddress }, { fetched: true });
		// 	return done();
		// }

		const tokens = Object.keys(constant.coinsContract).map(key => constant.coinsContract[key]);

		// get the balances
		const balances = await web3Client.estimateBalance(payload.accountAddress, tokens);
		if (!balances) return done(new Error("Something wronmg. Unable to balance"));

		let ercbalance = {};
		Object.keys(balances).map(contractAddress => {
			const coin = constant.coinsContractReverse[contractAddress];
			const coinKey = coin + "Amount";
			const decimal = constant.coins[coin].decimal;
			ercbalance[coinKey] = Number(safeMathhelper.convertFromPrecision(balances[contractAddress], decimal));
		});

		const updated = await coinRepository._updateItem({ accountAddress: payload.accountAddress }, { ...ercbalance, fetched: true });
		if (!updated || updated.error || !updated.value) return done(new Error("Unable to add to the db prices"));

		return done();

		// // get ether balance 
		// const ethbalance = await web3Client.getBalance(payload.accountAddress);
		// if (!ethbalance) return done(new Error("Something wronmg. unable to get ethere balance"));

		// if (payload.currencyType != "ETH") {
		// 	let ercbalance = {};
		// 	const tasks = Object.keys(constant.coins).map(coin => {
		// 		return async function (callback) {
		// 			const decimal = constant.coins[coin].decimal;
		// 			web3Client.initializeContract(constant.coins[coin].contractAddress);

		// 			const _balance = await web3Client.getContractBalance(constant.coins[coin].contractAddress, payload.accountAddress);
		// 			if (!_balance) return callback(null, null);
		// 			const coinKey = coin + "Amount";
		// 			ercbalance[coinKey] = Number(safeMathhelper.convertFromPrecision(_balance, decimal));
		// 			return callback(null, null);
		// 		};
		// 	});

		// 	async.parallelLimit(tasks, 40, async (err) => {
		// 		err && console.log("COIN SERVICE", "Something went wrong in async series", err);

		// 		const updated = await coinRepository._updateItem({ accountAddress: payload.accountAddress }, { ...ercbalance, fetched: true });
		// 		if (!updated || updated.error || !updated.value) return done(new Error("Unable to add to the db prices"));
		// 		return done();
		// 	});
		// } 
		// else {
		// 	// now convert the erc to respective 
		// 	// const updated = await coinRepository._updateItem({ accountAddress: payload.accountAddress }, { etherAmount: Number(ethbalance), fetched: true });
		// 	// if (!updated || updated.error || !updated.value) return done(new Error("Unable to add to the db prices"));
		// 	return done();
		// }
	} catch (exe) {
		console.log(exe);
		return done(new Error("Something wronmg"));
	}
};