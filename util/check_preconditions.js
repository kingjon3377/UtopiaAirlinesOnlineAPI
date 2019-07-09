const logger = require('../util/logger').createLogger('airportsController');
const constructResponse = require ('../util/construct_response');

module.exports = function(event, pathParameters, body, route, method, methodsForResponse) {
	if (event.httpMethod !== method) {
		logger.error(`Unsupported method for ${route}. Details: ${event}`);
		return constructResponse(405, { error: `Only ${methodsForResponse} supported` });
	} else if (event.queryStringParameters) {
		logger.error('Unwanted query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not yet supported' });
	} else if (event.multiValueQueryStringParameters) {
		logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not yet supported' });
	} else if (!pathParameters && event.pathParameters) {
		logger.error(`Unwanted path parameters provided to ${route}. Details: ${event}`);
		return constructResponse(400, { error: 'Path parameters not supported' });
	} else if (!body && event.body) {
		logger.error('Unwanted request body. Details: ' + event);
		return constructResponse(400, { error: 'Request body not supported' });
	} else if (body && !event.body) {
		logger.error('Missing request body. Details: ' + event);
		return constructResponse(400, { error: 'Request body required' });
	} else if (pathParameters) {
		if (!event.pathParameters) {
			logger.error(`Path parameter(s) must be provided to ${route}. Details: ${event}`);
			return constructResponse(400, { error: 'Parameter(s) required' });
		}
		for (const param of pathParameters) {
			if (!event.pathParameters[param]) {
				logger.error(`Path parameter ${param} must be provided to ${route}. Details: ${event}`);
				return constructResponse(400, { error: 'Parameter(s) required' });
			}
		}
		return null;
	} else {
		return null;
	}
};
