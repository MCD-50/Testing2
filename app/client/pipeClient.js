import * as constant from "../helper/constant";

const fs = require("fs");
const csv = require("csv");

export const readFile = (callback) => {
	return new Promise((resolve) => {
		try {
			const readStream = fs.createReadStream("/home/ayush/Testing2/app/client/Curr.csv");
			const csvStream = csv.parse({ columns: true });

			const arrayOfData = [];

			let count = 0;
			csvStream.on("data", function (data) {
				if (data.code == "ETH") {
					if (callback) callback(data, count++);
					else arrayOfData.push(data);
				}
			})
				.on("end", function () {
					console.log("ended");
					resolve({ value: arrayOfData.slice() });
				})
				.on("error", function (error) {
					console.log("ended", error);
					resolve({ error: true });
				});

			readStream.pipe(csvStream);
		} catch (exe) {
			console.log(exe);
			resolve({ error: true });
		}
	});
};