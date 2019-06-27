'use strict';
module.exports = function handleBackendResponse(outgoingResponse, logger) {
	return (err, response, body) => {
		if (err) {
			outgoingResponse.status(500);
			logger.error(err);
			outgoingResponse.send();
		} else {
			outgoingResponse.status(response.statusCode);
			outgoingResponse.send(body);
		}
	};
};
