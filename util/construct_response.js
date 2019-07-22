'use strict';
function constructResponse(statusCode, body) {
	let realBody;
	if (typeof body === 'string') {
		realBody = body;
	} else {
		realBody = JSON.stringify(body);
	}
	return {
		statusCode,
		headers: {
			'Content-Type': 'application/json'
		},
		body: realBody
	};
}

module.exports = constructResponse;
