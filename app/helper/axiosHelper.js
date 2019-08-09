import axios from "axios";

class AxiosHelper {
	sendRequest(pointingUrl, baseUrl = null, method = "GET", token = null, body = null) {
		return new Promise((resolve) => {
			// set requesting url
			const requestUrl = (baseUrl || "") + pointingUrl;

			// attach default header
			const headers = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			};

			if (token) headers["Authorization"] = token;

			// if request has body then change method to post if not present
			if (body) {
				method = method || "POST";

				// transfer body in payload
				body = { payload: body };
			}

			// prepare request options
			const requestOptions = { url: requestUrl, method, headers, data: body };

			axios(requestOptions).then(response => this.resolveResponse(null, response, resolve))
				.catch(error => this.resolveResponse(error, null, resolve));
		});
	}

	sendRequestWithoutEnclosingPayload(pointingUrl, baseUrl = null, method = "GET", token = null, body = null) {
		return new Promise((resolve) => {
			// set requesting url
			const requestUrl = (baseUrl || "") + pointingUrl;

			// attach default header
			const headers = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			};

			if (token) headers["Authorization"] = token;

			// if request has body then change method to post if not present
			if (body) {
				method = method || "POST";
			}

			// prepare request options
			const requestOptions = { url: requestUrl, method, headers, data: body };

			console.log(requestOptions);

			axios(requestOptions).then(response => this.resolveResponse(null, response, resolve))
				.catch(error => this.resolveResponse(error, null, resolve));
		});
	}

	sendSpecialRequest(url) {
		return new Promise((resolve) => {
			// attach default header
			const headers = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			};

			// prepare request options
			const requestOptions = { url: url, method: "get", headers, data: null };
			axios(requestOptions).then(response => resolve({ error: null, result: response.data }))
				.catch(error => resolve({ error: error, result: null }));
		});
	}

	resolveResponse(error, response, callback) {
		try {
			if (response && response.data) return callback({ result: response.data && response.data.result || null });
			else if (error && error.data) return callback({ error: error.data, result: null });
			else return callback({ error: "Something went wrong. Unable to capture error values" });
		} catch (exe) {
			console.log(exe);
			return callback({ error: "Connection error", result: null });
		}
	}
}

const axiosHelper = new AxiosHelper();
export default axiosHelper;