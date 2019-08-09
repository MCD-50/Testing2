"use strict";

module.exports = exports = function pagingPlugin(schema) {
	schema.statics.paging = function (options, cb) {
		var thisSchema = this;

		if (!options.filter) {
			options.filter = {};
		}

		if (!options.keys) {
			options.keys = "";
		}

		if (!options.limit) {
			options.limit = 20;
		}

		if (!options.page) {
			options.page = 1;
		}

		if (!options.sort) {
			options.sort = {};
		}

		var output = {
			rows: null,
			count: 0
		};

		var countResults = function (callback) {
			thisSchema.count(options.filter, function (err, count) {
				output.count = count;
				callback(null, "done counting");
			});
		};

		var getResults = function (callback) {
			var query = thisSchema.find(options.filter, options.keys);
			query.skip((options.page - 1) * options.limit);
			query.limit(options.limit);
			query.sort(options.sort);
			if (options.populate) query.populate(options.populate);
			query.exec(function (err, results) {
				output.rows = results;
				callback(null, "done getting records");
			});
		};

		require("async").parallel([
			countResults,
			getResults
		],
		function (err, results) {
			if (err) {
				cb(err, null);
			}

			//final paging math
			// output.pages.total = Math.ceil(output.items.total / options.limit);
			// output.pages.next = ((output.pages.current + 1) > output.pages.total ? 0 : output.pages.current + 1);
			// output.pages.hasNext = (output.pages.next !== 0);
			// output.pages.prev = output.pages.current - 1;
			// output.pages.hasPrev = (output.pages.prev !== 0);
			// if (output.items.end > output.items.total) {
			// 	output.items.end = output.items.total;
			// }

			cb(null, { ...output });
		});
	};
};