'use strict';
const got = require('got');
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const logger = require('../util/logger').createLogger('flightsController');
const constructResponse = require ('../util/construct_response');

module.exports = {
	allFlights: async function(event) {
		if (event.httpMethod === 'GET') {
			if (event.queryStringParameters) {
				logger.error('Unwanted query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not yet supported' });
			} else if (event.multiValueQueryStringParameters) {
				logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not yet supported' });
			} else if (event.pathParameters) {
				logger.error('Unwanted path parameters provided to /flights. Details: ' + event);
				return constructResponse(400, { error: 'Path parameters not supported' });
			} else {
				const resp = await got(`${searchEndpoint}/flights`);
				return constructResponse(resp.statusCode, resp.body);
			}
		} else {
			logger.error('Unsupported method for /airports. Details: ' + event);
			return constructResponse(405, { error: 'Only GET supported for /flights' });
		}
	},

	oneFlight: async function(event) {
		if (event.httpMethod === 'GET') {
			if (event.queryStringParameters) {
				logger.error('Unwanted query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not supported' });
			} else if (event.multiValueQueryStringParameters) {
				logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not supported' });
			} else if (!event.pathParameters) {
				logger.error('Path parameter must be provided to /flight/. Details: ' + event);
				return constructResponse(400, { error: 'Flight number required' });
			} else if (!event.pathParameters.flightId) {
				logger.error('Flight number path parameter must be provided to /flight/. Details: ' + event);
				return constructResponse(400, { error: 'Flight number required' });
			} else {
				const resp = await got(`${searchEndpoint}/flightDetails?flight=${event.pathParameters.flightId}`);
				return constructResponse(resp.statusCode, resp.body);
			}
		} else {
			logger.error('Unsupported method for /flight/:flightNumber. Details: ' + event);
			return constructResponse(405, { error: 'Only GET method supported' });
		}
	}
};
