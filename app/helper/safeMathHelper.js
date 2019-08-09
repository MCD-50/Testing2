import * as bigNumber from "bignumber.js";

export const convertToPrecision = (amount, precision = 8) => {
	return new bigNumber.BigNumber(Number(amount).toPrecision(8).toString()).times((new bigNumber.BigNumber(10)).pow(precision)).toString();
};

export const convertFromPrecision = (amount, precision = 8) => {
	return new bigNumber.BigNumber(amount).div((new bigNumber.BigNumber(10)).pow(precision)).toString();
};


export const safeParseFloat = (value, defaultValue = 0, precision = 8) => {
	if ((value == null || value == undefined) || isNaN(value) || (typeof (value) == "string" && value.length < 1)) {
		return defaultValue;
	} else {
		try {
			const parsedValue = new bigNumber.BigNumber(new bigNumber.BigNumber(value).toFixed(precision)).toNumber();
			if (parsedValue < 0 || isNaN(parsedValue)) {
				return 0;
			}
			return parsedValue;
		} catch (exe) {
			console.log(exe);
			return 0;
		}
	}
};

export const safeParseInt = (value, defaultValue = 0) => {
	if ((value == null || value == undefined) || isNaN(value) || (typeof (value) == "string" && value.length < 1)) {
		return defaultValue;
	} else {
		try {
			const parsedValue = parseInt(value);
			if (parsedValue < 0 || isNaN(parsedValue)) {
				return 0;
			}
			return parsedValue;
		} catch (exe) {
			console.log(exe);
			return 0;
		}
	}
};

export const safeAdd = (value1, value2, defaultValue = 0) => {
	if ((value1 == null || value1 == undefined) || isNaN(value1) || (typeof (value1) == "string" && value1.length < 1)
		|| (value2 == null || value2 == undefined) || isNaN(value2) || (typeof (value2) == "string" && value2.length < 1)) {
		throw { error: "Invalid values..." };
	} else {
		try {
			const parsedValue1 = safeParseFloat(value1);
			const parsedValue2 = safeParseFloat(value2);
			if (parsedValue1 < 0 || isNaN(parsedValue1) || parsedValue2 < 0 || isNaN(parsedValue2)) {
				throw { error: "Invalid values..." };
			}

			const resultantValue = parsedValue1 + parsedValue2;
			return safeParseFloat(resultantValue);
		} catch (exe) {
			console.log(exe);
			throw { error: "Invalid values..." };
		}
	}
};

export const safeMultiply = (value1, value2, defaultValue = 0) => {
	if ((value1 == null || value1 == undefined) || isNaN(value1) || (typeof (value1) == "string" && value1.length < 1)
		|| (value2 == null || value2 == undefined) || isNaN(value2) || (typeof (value2) == "string" && value2.length < 1)) {
		throw { error: "Invalid values..." };
	} else {
		try {
			const parsedValue1 = safeParseFloat(value1);
			const parsedValue2 = safeParseFloat(value2);
			if (parsedValue1 < 0 || isNaN(parsedValue1) || parsedValue2 < 0 || isNaN(parsedValue2)) {
				throw { error: "Invalid values..." };
			}

			const resultantValue = parsedValue1 * parsedValue2;
			return safeParseFloat(resultantValue);
		} catch (exe) {
			console.log(exe);
			throw { error: "Invalid values..." };
		}
	}
};

export const safeSubtract = (value1, value2, defaultValue = 0) => {
	if ((value1 == null || value1 == undefined) || isNaN(value1) || (typeof (value1) == "string" && value1.length < 1)
		|| (value2 == null || value2 == undefined) || isNaN(value2) || (typeof (value2) == "string" && value2.length < 1)) {
		throw { error: "Invalid values..." };
	} else {
		try {
			const parsedValue1 = safeParseFloat(value1);
			const parsedValue2 = safeParseFloat(value2);
			if (parsedValue1 < 0 || isNaN(parsedValue1) || parsedValue2 < 0 || isNaN(parsedValue2)) {
				throw { error: "Invalid values..." };
			}

			if (parsedValue1 >= parsedValue2) {
				return safeParseFloat(parsedValue1 - parsedValue2);
			} else {
				throw { error: "Invalid values..." };
			}
		} catch (exe) {
			console.log(exe);
			throw { error: "Invalid values..." };
		}
	}
};

export const safeDivide = (value1, value2, defaultValue = 0) => {
	if ((value1 == null || value1 == undefined) || isNaN(value1) || (typeof (value1) == "string" && value1.length < 1)
		|| (value2 == null || value2 == undefined) || isNaN(value2) || (typeof (value2) == "string" && value2.length < 1)) {
		throw { error: "Invalid values..." };
	} else {
		try {
			const parsedValue1 = safeParseFloat(value1);
			const parsedValue2 = safeParseFloat(value2);
			if (parsedValue1 < 0 || isNaN(parsedValue1) || parsedValue2 < 0 || isNaN(parsedValue2)) {
				throw { error: "Invalid values..." };
			}

			if (parsedValue2 > 0) {
				return safeParseFloat(parsedValue1 / parsedValue2);
			} else {
				throw { error: "Invalid values..." };
			}
		} catch (exe) {
			console.log(exe);
			throw { error: "Invalid values..." };
		}
	}
};