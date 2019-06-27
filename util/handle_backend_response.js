'use strict';
module.exports = function handleBackendResponse(outgoingResponse) {
	return (err, response, body) => {
		if (err) {
			outgoingResponse.status(500);
			console.log(err);
			outgoingResponse.send();
		} else {
			outgoingResponse.status(response.statusCode);
			outgoingResponse.send(body);
		}
	};
};
