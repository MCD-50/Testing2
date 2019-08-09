const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const speakEasy = require("speakeasy");

import * as constant from "../helper/constant";

class SecurityClient {

	constructor() { }

	jwtEncode(payload) {
		try {
			return jwt.sign(payload, constant.config.utils.JWT_SECRET, { expiresIn: constant.config.utils.REDIS_TOKEN_EXPIRE });
		} catch (exe) {
			console.log("SECURITY", "Something went wrong", exe);
			return null;
		}
	}

	jwtDecode(token) {
		try {
			return jwt.decode(token);
		} catch (exe) {
			console.log("SECURITY", "Something went wrong", exe);
			return null;
		}
	}

	jwtVerify(token) {
		try {
			return jwt.verify(token, constant.config.utils.JWT_SECRET);
		} catch (exe) {
			console.log("SECURITY", "Something went wrong", exe);
			return null;
		}
	}


	hash(plainText) {
		try {
			return md5(plainText);
		} catch (exe) {
			console.log("SECURITY", "Something went wrong", exe);
			return null;
		}
	}


	encrypt(plainText) {
		try {
			return cryptoJs.AES.encrypt(plainText, constant.config.utils.WALLET_SALT).toString();
		} catch (exe) {
			console.log("SECURITY", "Something went wrong", exe);
			return null;
		}
	}

	decrypt(cipherText) {
		try {
			return cryptoJs.AES.decrypt(cipherText, constant.config.utils.WALLET_SALT).toString(cryptoJs.enc.Utf8);
		} catch (exe) {
			console.log("SECURITY", "Something went wrong", exe);
			return null;
		}
	}

	create2Fa() {
		try {
			return speakEasy.generateSecret({ length: 20 }).base32;
		} catch (exe) {
			console.log("SECURITY", "Something went wrong", exe);
			return null;
		}
	}

	verify2Fa(secret, otp) {
		try {
			secret = this.decrypt(secret);
			return speakEasy.totp.verify({ secret: secret, encoding: "base32", token: otp, window: 2 });
		} catch (exe) {
			console.log("SECURITY", "Something went wrong", exe);
			return null;
		}
	}
}


const securityClient = new SecurityClient();
export default securityClient;