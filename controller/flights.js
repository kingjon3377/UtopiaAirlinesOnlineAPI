'use strict';
const got = require('got');
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const checkPreconditions = require('../util/check_preconditions');
const constructResponseFrom = require('../util/construct_response_from');

module.exports = {
	allFlights: async function(event) {
		const errResp = checkPreconditions(event, false, false, '/flights', 'GET', 'GET');
		if (errResp) {
			return errResp;
		} else {
			return constructResponseFrom(await got(`${searchEndpoint}/flights`));
		}
	},

	oneFlight: async function(event) {
		const errResp = checkPreconditions(event, ['flightId'], false, '/flights', 'GET', 'GET');
		if (errResp) {
			return errResp;
		} else {
			return constructResponseFrom(await got(`${searchEndpoint}/flightDetails?flight=${event.pathParameters.flightId}`));
		}
	}
};
