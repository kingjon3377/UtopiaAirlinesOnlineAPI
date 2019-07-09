'use strict';
const got = require('got');
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const checkPreconditions = require('../util/check_preconditions');
const constructResponseFrom = require('../util/construct_response_from');

module.exports = {
	allAirports: async function(event) {
		const errResp = checkPreconditions(event, false, false, '/airports', 'GET', 'GET');
		if (errResp) {
			return errResp;
		} else {
			return constructResponseFrom(await got(`${searchEndpoint}/airports`));
		}
	},

	oneAirport: async function(event) {
		const errResp = checkPreconditions(event, ['code'], false, '/airport/', 'GET', 'GET');
		if (errResp) {
			return errResp;
		} else {
			return constructResponseFrom(await got(`${searchEndpoint}/airportDetails?airport=${event.pathParameters.code}`));
		}
	}
};
