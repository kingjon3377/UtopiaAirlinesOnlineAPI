'use strict';
const got = require('got');
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const logger = require('../util/logger').createLogger('airportsController');
const constructResponse = require ('../util/construct_response');
const checkPreconditions = require('../util/check_preconditions');

module.exports = {
	allAirports: async function(event) {
		if (event.httpMethod === 'GET') {
			const errResp = checkPreconditions(event, false, false, '/airports');
			if (errResp) {
				return errResp;
			} else {
				const resp = await got(`${searchEndpoint}/airports`);
				return constructResponse(resp.statusCode, resp.body);
			}
		} else {
			logger.error('Unsupported method for /airports. Details: ' + event);
			return constructResponse(405, { error: 'Only GET supported for /airports' });
		}
	},

	oneAirport: async function(event) {
		if (event.httpMethod === 'GET') {
			const errResp = checkPreconditions(event, ['code'], false, '/airport/');
			if (errResp) {
				return errResp;
			} else {
				const resp = await got(`${searchEndpoint}/airportDetails?airport=${event.pathParameters.code}`);
				return constructResponse(resp.statusCode, resp.body);
			}
		} else {
			logger.error('Unsupported method for /airport/:code. Details: ' + event);
			return constructResponse(405, { error: 'Only GET method supported' });
		}
	}
};
