'use strict';
const request = require('request');
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const handleBackendResponse = require('../util/handle_backend_response.js');
const logger = require('../util/logger').createLogger('airportsController');
const constructResponse = require ('../util/construct_response');

module.exports = {
	allAirports: function(event) {
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
				const response = {};
				request.get(`${searchEndpoint}/airports`, {},
					handleBackendResponse(response, logger));
				return response;
			}
		} else {
			logger.error('Unsupported method for /airports. Details: ' + event);
			return constructResponse(405, { error: 'Only GET supported for /airports' });
		}
	},

	oneAirport: function(event) {
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
				const response = {};
				request.get(`${searchEndpoint}/airportDetails?airport=${event.pathParameters.code}`,
					{}, handleBackendResponse(response, logger));
				return response;
			}
		} else {
			logger.error('Unsupported method for /airport/:code. Details: ' + event);
			return constructResponse(405, { error: 'Only GET method supported' });
		}
	}
}
