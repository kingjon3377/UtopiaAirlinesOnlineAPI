'use strict';
const got = require('got');
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const logger = require('../util/logger').createLogger('flightsController');
const constructResponse = require ('../util/construct_response');
const checkPreconditions = require('../util/check_preconditions');

module.exports = {
	allFlights: async function(event) {
		const errResp = checkPreconditions(event, false, false, '/flights', 'GET', 'GET');
		if (errResp) {
			return errResp;
		} else {
			const resp = await got(`${searchEndpoint}/flights`);
			return constructResponse(resp.statusCode, resp.body);
		}
	},

	oneFlight: async function(event) {
		const errResp = checkPreconditions(event, ['flightId'], false, '/flights', 'GET', 'GET');
		if (errResp) {
			return errResp;
		} else {
			const resp = await got(`${searchEndpoint}/flightDetails?flight=${event.pathParameters.flightId}`);
			return constructResponse(resp.statusCode, resp.body);
		}
	}
};
