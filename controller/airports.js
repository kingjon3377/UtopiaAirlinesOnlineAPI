'use strict';
const got = require('got');
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const logger = require('../util/logger').createLogger('airportsController');
const constructResponse = require ('../util/construct_response');
const checkPreconditions = require('../util/check_preconditions');

module.exports = {
	allAirports: async function(event) {
		const errResp = checkPreconditions(event, false, false, '/airports', 'GET', 'GET');
		if (errResp) {
			return errResp;
		} else {
			const resp = await got(`${searchEndpoint}/airports`);
			return constructResponse(resp.statusCode, resp.body);
		}
	},

	oneAirport: async function(event) {
		const errResp = checkPreconditions(event, ['code'], false, '/airport/', 'GET', 'GET');
		if (errResp) {
			return errResp;
		} else {
			const resp = await got(`${searchEndpoint}/airportDetails?airport=${event.pathParameters.code}`);
			return constructResponse(resp.statusCode, resp.body);
		}
	}
};
