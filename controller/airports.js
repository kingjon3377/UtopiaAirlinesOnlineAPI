'use strict';
const got = require('got');
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const logger = require('../util/logger').createLogger('airportsController');
const constructResponse = require ('../util/construct_response');

module.exports = {
	allAirports: async function(event) {
		if (event.httpMethod === 'GET') {
			if (event.queryStringParameters) {
				logger.error('Unwanted query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not yet supported' });
			} else if (event.multiValueQueryStringParameters) {
				logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not yet supported' });
			} else if (event.pathParameters) {
				logger.error('Unwanted path parameters provided to /airports. Details: ' + event);
				return constructResponse(400, { error: 'Path parameters not supported' });
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
			if (event.queryStringParameters) {
				logger.error('Unwanted query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not supported' });
			} else if (event.multiValueQueryStringParameters) {
				logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not supported' });
			} else if (!event.pathParameters) {
				logger.error('Path parameter must be provided to /airport/. Details: ' + event);
				return constructResponse(400, { error: 'Airport code required' });
			} else if (!event.pathParameters.code) {
				logger.error('Code path parameter must be provided to /airport/. Details: ' + event);
				return constructResponse(400, { error: 'Airport code required' });
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
