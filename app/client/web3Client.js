import web3 from "web3";
import * as checker from "eth-balance-checker/lib/web3";

const ethereumTx = require("ethereumjs-tx");

import * as constant from "../helper/constant";
import * as safeMathHelper from "../helper/safeMathHelper";

import appFactoryHelper from "../helper/appFactoryHelper";

class BlockchainClient {
	constructor() {
		//const provider = new web3.providers.HttpProvider(constant.config.blockchain.infura);
		this.web3Client = new web3(constant.config.blockchain.infura);

		// status check
		this.checkIfInitialized();
	}

	async checkIfInitialized() {
		const isListening = await this.web3Client.eth.net.isListening();
		if (!isListening) return console.log("BLOCKCHAIN", "WEB3 not listening", { error: "WEB3 not listening" });
	}

	createAccount(password) {
		return new Promise(async (resolve) => {
			try {
				const account = this.web3Client.eth.accounts.create(password);
				const result = { address: account.address, privateKey: account.privateKey, password };
				resolve(this.resolveResponse({ result }));
			} catch (exe) {
				resolve(null);
			}
		});
	}

	unlockAccount(accountAddress, password) {
		return new Promise(async (resolve) => {
			try {
				this.web3Client.eth.personal.unlockAccount(accountAddress, password, 1000);
				resolve(this.resolveResponse({ result: true }));
			} catch (exe) {
				resolve(null);
			}
		});
	}

	estimateBalance(address, tokens) {
		return new Promise(async (resolve) => {
			try {
				checker.getAddressBalances(this.web3Client, address, tokens)
					.then(bals => resolve(this.resolveResponse({ result: bals })))
					.catch(exe => resolve(null));
			} catch (exe) {
				resolve(null);
			}
		});
	}

	estimateBalances(addresses, tokens) {
		return new Promise(async (resolve) => {
			try {
				checker.getAddressesBalances(this.web3Client, addresses, tokens)
					.then(bals => resolve(this.resolveResponse({ result: bals })))
					.catch(exe => {
						console.log(exe);
						resolve(null)
					});
			} catch (exe) {
				console.log(exe);
				resolve(null);
			}
		});
	}


	estimateNonce(address) {
		return new Promise(async (resolve) => {
			try {
				await this.web3Client.eth.getTransactionCount(address, "pending")
					.then(nonce => resolve(this.resolveResponse({ result: nonce })))
					.catch(exe => resolve(null));

			} catch (exe) {
				resolve(null);
			}
		});
	}

	estimateGas(payload) {
		return new Promise(async (resolve) => {
			try {
				await this.web3Client.eth.estimateGas({ to: payload.to, from: payload.from })
					.then(gas => resolve(this.resolveResponse({ result: gas })))
					.catch(exe => resolve(null));

			} catch (exe) {
				resolve(null);
			}
		});
	}

	estimatePrice() {
		return new Promise(async (resolve) => {
			try {
				await this.web3Client.eth.getGasPrice()
					.then(price => resolve(this.resolveResponse({ result: price })))
					.catch(exe => resolve(null));

			} catch (exe) {
				resolve(null);
			}
		});
	}

	getBlockNumber() {
		return new Promise(async (resolve) => {
			try {
				await this.web3Client.eth.getBlockNumber()
					.then(number => resolve(this.resolveResponse({ result: number })))
					.catch(exe => resolve(null));
			} catch (exe) {
				resolve(null);
			}
		});
	}

	getBlock(blockNumber) {
		return new Promise(async (resolve) => {
			try {
				await this.web3Client.eth.getBlock(blockNumber, true)
					.then(block => resolve(this.resolveResponse({ result: block })))
					.catch(exe => resolve(null));
			} catch (exe) {
				resolve(null);
			}
		});
	}

	getBalance(accountAddress, blockNumber = "latest") {
		return new Promise(async (resolve) => {
			try {
				await this.web3Client.eth.getBalance(accountAddress, blockNumber)
					.then(balance => {
						// console.log("ether", balance);
						resolve(this.resolveResponse({ result: this.web3Client.utils.fromWei(balance, "ether") }));
					})
					.catch(exe => resolve(null));
			} catch (exe) {
				resolve(null);
			}
		});
	}

	getTransactionCount(accountAddress) {
		return new Promise(async (resolve) => {
			try {
				await this.web3Client.eth.getTransactionCount(accountAddress)
					.then(count => resolve(this.resolveResponse({ result: count })))
					.catch(exe => resolve(null));
			} catch (exe) {
				resolve(null);
			}
		});
	}

	getContractBalance(contractAddress, accountAddress) {
		return new Promise(async (resolve) => {
			try {
				const contractInstance = appFactoryHelper.resolveInstance(contractAddress);
				contractInstance.methods.balanceOf(accountAddress).call()
					.then(balance => {
						console.log(balance);
						// console.log("erc", balance.toString());
						resolve(this.resolveResponse({ result: balance.toString() }));
					})
					.catch((exe) => {
						console.log(exe);
					});
			} catch (exe) {
				console.log(exe);
				resolve(null);
			}
		});
	}

	getTransaction(hash) {
		return new Promise(async (resolve) => {
			try {
				await this.web3Client.eth.getTransaction(hash)
					.then(trx => resolve(this.resolveResponse({ result: trx })))
					.catch(exe => resolve(null));
			} catch (exe) {
				resolve(null);
			}
		});
	}

	initializeContract(contractAddress) {
		// eslint-disable-next-line quotes
		if (!appFactoryHelper.resolveInstance(contractAddress)) {
			const abi = constant.baseAbi;
			const instance = new this.web3Client.eth.Contract(abi, contractAddress);
			appFactoryHelper.addInstance(contractAddress, instance);
		}
	}

	// send ether
	sendEther(payload) {
		return new Promise(async (resolve) => {
			try {
				const gasLimit = await this.estimateGas(payload);
				const gasPrice = await this.estimatePrice();
				const nonce = await this.estimateNonce(payload.from);
				if (!gasLimit || !gasPrice || nonce == null) return resolve(null);

				// prepare transaction
				const _trx = {
					nonce: nonce,
					chainId: constant.config.blockchain.chain,
					from: payload.from,
					to: payload.to,
					value: Number(payload.value),
					gasPrice: safeMathHelper.safeMultiply(gasPrice, 1.5),
					gas: safeMathHelper.safeMultiply(gasLimit, 2),
				};

				// replace leading 0x if exists 
				payload.privateKey = payload.privateKey.replace("0x", "").trim();

				const privateKey = new Buffer(payload.privateKey, "hex");
				const ethTrx = new ethereumTx(_trx);
				ethTrx.sign(privateKey);
				const _strx = "0x" + ethTrx.serialize().toString("hex");

				this.web3Client.eth.sendSignedTransaction(_strx, (err, hash) => {
					if (err) {
						console.log(err);
						return resolve(null);
					}
					return resolve(hash);
				});
			} catch (exe) {
				console.log(exe);
				resolve(null);
			}
		});
	}

	// send erc
	sendErc(payload) {
		return new Promise(async (resolve) => {
			try {
				const gasLimit = await this.estimateGas(payload);
				const gasPrice = await this.estimatePrice();
				const nonce = await this.estimateNonce(payload.from);
				if (!gasLimit || !gasPrice || nonce == null) return resolve(null);

				const contractInstance = appFactoryHelper.resolveInstance(payload.contractAddress);
				if (!contractInstance) {
					console.log("Contract not initialized");
					return resolve(null);
				}

				// prepare transaction
				const _trx = {
					nonce: nonce,
					chainId: constant.config.blockchain.chain,
					from: payload.from,
					to: payload.contractAddress,
					data: contractInstance.methods.transfer(payload.to, payload.value).encodeABI(),
					value: "0x0",
					gasPrice: safeMathHelper.safeMultiply(gasPrice, 1.5),
					gas: safeMathHelper.safeMultiply(gasLimit, 3),
				};

				const privateKey = new Buffer(payload.privateKey, "hex");
				const ethTrx = new ethereumTx(_trx);
				ethTrx.sign(privateKey);
				const _strx = "0x" + ethTrx.serialize().toString("hex");

				this.web3Client.eth.sendSignedTransaction(_strx, (err, hash) => {
					if (err) {
						console.log(err);
						return resolve(null);
					}
					return resolve(hash);
				});
			} catch (exe) {
				console.log(exe);
				resolve(null);
			}
		});
	}

	sendErcFrom(payload) {
		return new Promise(async (resolve) => {
			try {
				const gasLimit = await this.estimateGas(payload);
				const gasPrice = await this.estimatePrice();
				if (!gasLimit || !gasPrice) return resolve(null);

				const contractInstance = appFactoryHelper.resolveInstance(payload.contractAddress);
				if (!contractInstance) {
					console.log("Contract not initialized");
					return resolve(null);
				}

				// place the password here
				await this.unlockAccount(payload.signer, "");

				contractInstance.methods.transferFrom(payload.from, payload.to, payload.value,
					{
						from: payload.signer,
						gasPrice: safeMathHelper.safeMultiply(gasPrice, 1.5),
						gas: safeMathHelper.safeMultiply(gasLimit, 3),
					}, (err, hash) => {
						if (err) {
							console.log(err);
							return resolve(null);
						}
						return resolve(hash);
					});
			} catch (exe) {
				console.log(exe);
				resolve(null);
			}
		});
	}

	resolveResponse(data, method) {
		if (data && data.result != null) {
			return data.result;
		} else if (!data.result && !data.error && method && method == "eth_getBlockByNumber") {
			return { transactions: [] };
		} else {
			console.log("BLOCKCHAIN", "No response");
			return null;
		}
	}
}


const blockchainClient = new BlockchainClient();
export default blockchainClient;