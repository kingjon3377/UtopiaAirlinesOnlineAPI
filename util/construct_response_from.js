'use strict';
const constructResponse = require('./construct_response');

module.exports = function(input) {
	return constructResponse(input.statusCode, input.body);
};
