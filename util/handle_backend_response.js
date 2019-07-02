'use strict';
module.exports = function handleBackendResponse(outgoingResponse, logger) {
	return (err, response, body) => {
		outgoingResponse.headers = { 'Content-Type': 'application/json' };
		if (err) {
			outgoingResponse.statusCode = 500;
			logger.error(err);
			outgoingResponse.body = '{}';
		} else {
			outgoingResponse.statusCode = response.statusCode;
			outgoingResponse.body = JSON.stringify(body);
		}
	};
};
