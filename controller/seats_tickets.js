'use strict';
const request = require('request');
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const bookingEndpoint = process.env.BOOKING_ENDPOINT;
const cancellationEndpoint = process.env.CANCELLATION_ENDPOINT;
const handleBackendResponse = require('../util/handle_backend_response.js');
const logger = require('../util/logger').createLogger('ticketsController');
const constructResponse = require ('../util/construct_response');

function putTicket(event) {
	if (event.queryStringParameters) {
		logger.error('Unwanted query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not yet supported' });
	} else if (event.multiValueQueryStringParameters) {
		logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not yet supported' });
	} else if (!event.pathParameters) {
		logger.error('Path parameter must be provided to /flight/:flightId/seats. Details: ' + event);
		return constructResponse(400, { error: 'Flight number required' });
	} else if (!event.pathParameters.flightId || !event.pathParameters.row || !event.pathParameters.seatId) {
		logger.error('Flight number, row, and seat path parameters must be provided to /flight/:flightId/seats. Details: ' + event);
		return constructResponse(400, { error: 'Flight number, row, and seat required' });
	} else if (!event.body) {
		logger.error('Body required. Details: ' + event);
		return constructResponse(400, { error: 'Request body required' });
	} else {
		let body = JSON.parse(event.body);
		const response = {};
		if (body.price) {
			request.put(
				`${bookingEndpoint}/booking/pay/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`,
				{ body: {'price': body.price }},
				handleBackendResponse(response, logger));
		} else {
			request.put(
				`${bookingEndpoint}/booking/extend/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`,
				{}, handleBackendResponse(response, logger));
		}
		return response;
	}
}

function postTicket(event) {
	if (event.queryStringParameters) {
		logger.error('Unwanted query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not yet supported' });
	} else if (event.multiValueQueryStringParameters) {
		logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not yet supported' });
	} else if (!event.pathParameters) {
		logger.error('Path parameter must be provided to /flight/:flightId/seats. Details: ' + event);
		return constructResponse(400, { error: 'Flight number required' });
	} else if (!event.pathParameters.flightId || !event.pathParameters.row || !event.pathParameters.seatId) {
		logger.error('Flight number, row, and seat path parameters must be provided to /flight/:flightId/seats. Details: ' + event);
		return constructResponse(400, { error: 'Flight number, row, and seat required' });
	} else if (!event.body) {
		logger.error('Body required. Details: ' + event);
		return constructResponse(400, { error: 'Request body required' });
	} else {
		let body = JSON.parse(event.body);
		if (!body.reserver || !body.reserver.id) {
			logger.error('Reserver required in body. Details: ' + event);
			return constructResponse(400, { error: 'Reserver required' });
		} else {
			const response = {};
			request.put(
				`${bookingEndpoint}/booking/pay/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`,
				{ json: { 'id': body.reserver.id } },
				handleBackendResponse(response, logger));
			return response;
		}
	}
}

function deleteTicket(event) {
	if (event.queryStringParameters) {
		logger.error('Unwanted query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not yet supported' });
	} else if (event.multiValueQueryStringParameters) {
		logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not yet supported' });
	} else if (!event.pathParameters) {
		logger.error('Path parameter must be provided to /flight/:flightId/seats. Details: ' + event);
		return constructResponse(400, { error: 'Flight number required' });
	} else if (!event.pathParameters.flightId || !event.pathParameters.row || !event.pathParameters.seatId) {
		logger.error('Flight number, row, and seat path parameters must be provided to /flight/:flightId/seats. Details: ' + event);
		return constructResponse(400, { error: 'Flight number, row, and seat required' });
	} else if (event.body) {
		logger.error('Unwanted body. Details: ' + event);
		return constructResponse(400, { error: 'Request body required' });
	} else {
		const response = {};
		request.get(
			`${bookingEndpoint}/booking/details/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`,
			{}, function(err, resp, body) {
				if (err) {
					response.statusCode = 500;
					response.headers = { 'Content-Type': 'application/json' };
					response.body = '{ "error": "Error in backend service" }';
					logger.error(err);
				} else {
					const returned = JSON.parse(body);
					if (!returned.reserved) {
						response.statusCode = 204;
						response.body = '';
					} else if (returned.price) {
						// DELETE makes more sense, but the cancellation service uses PUT at the moment
						request.put(
							`${cancellationEndpoint}/cancel/ticket/flight/${event.pathParameters.flightId}/row/${event.pathParameters.row}/seat/${event.pathParameters.seatId}`,
							{}, handleBackendResponse(response, logger));
					} else {
						request.delete(
							`${bookingEndpoint}/booking/book/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`,
							{}, handleBackendResponse(response, logger));
					}
				}
			});
			return response;
		}
	}
}

function getBooking(event) {
	if (event.queryStringParameters) {
		logger.error('Unwanted query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not supported' });
	} else if (event.multiValueQueryStringParameters) {
		logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not supported' });
	} else if (!event.pathParameters) {
		logger.error('Path parameter must be provided to /booking/. Details: ' + event);
		return constructResponse(400, { error: 'Booking ID required' });
	} else if (!event.pathParameters.bookingCode) {
		logger.error('Booking code must be provided to /booking/. Details: ' + event);
		return constructResponse(400, { error: 'Booking code required' });
	} else {
		const response = {};
		request.get(`${bookingEndpoint}/booking/details/bookings/${event.pathParameters.bookingCode}`, {},
			handleBackendResponse(response, logger));
		return response;
	}
}

function putBooking(event) {
	if (event.queryStringParameters) {
		logger.error('Unwanted query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not yet supported' });
	} else if (event.multiValueQueryStringParameters) {
		logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not yet supported' });
	} else if (!event.pathParameters) {
		logger.error('Path parameter must be provided to /booking/. Details: ' + event);
		return constructResponse(400, { error: 'Booking code required' });
	} else if (!event.pathParameters.bookingCode) {
		logger.error('Path parameter must be provided to /booking/. Details: ' + event);
		return constructResponse(400, { error: 'Flight number, row, and seat required' });
	} else if (!event.body) {
		logger.error('Body required. Details: ' + event);
		return constructResponse(400, { error: 'Request body required' });
	} else {
		let body = JSON.parse(event.body);
		if (body.price) {
			request.put(`${bookingEndpoint}/booking/pay/bookings/${event.pathParameters.bookingCode}`,
				{ body: {'price': body.price }}, handleBackendResponse(response, logger));
		} else {
			request.put(`${bookingEndpoint}/booking/extend/bookings/${event.pathParameters.bookingCode}`,
				{}, handleBackendResponse(response, logger));
		}
	}
}

function deleteBooking(event) {
	if (event.queryStringParameters) {
		logger.error('Unwanted query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not supported' });
	} else if (event.multiValueQueryStringParameters) {
		logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
		return constructResponse(400, { error: 'Query parameters not supported' });
	} else if (!event.pathParameters) {
		logger.error('Path parameter must be provided to /booking/. Details: ' + event);
		return constructResponse(400, { error: 'Booking ID required' });
	} else if (!event.pathParameters.bookingCode) {
		logger.error('Booking code must be provided to /booking/. Details: ' + event);
		return constructResponse(400, { error: 'Booking code required' });
	} else {
		const response = {};
		request.get(`${bookingEndpoint}/booking/details/bookings/${event.pathParameters.bookingCode}`,
			{}, function(err, resp, body) {
				if (err) {
					response.statusCode = 500;
					response.headers = { 'Content-Type': 'application/json' };
					response.body = '{ "error": "Error in backend service" }';
					logger.error(err);
				} else {
					const returned = JSON.parse(body);
					if (!returned.reserved) {
						response.statusCode = 204;
						response.body = '';
					} else if (returned.price) {
						request.delete(
							`${cancellationEndpoint}/cancel/ticket/booking/${event.pathParameters.bookingCode}`,
							{}, handleBackendResponse(response, logger));
					} else {
						request.delete(
							`${bookingEndpoint}/booking/book/bookings/${event.pathParameters.bookingCode}`,
							{}, handleBackendResponse(response, logger));
					}
				}
			});
		return response;
	}
}

module.exports = {
	allSeatsOnFlight: function(event) {
		if (event.httpMethod === 'GET') {
			if (event.queryStringParameters) {
				logger.error('Unwanted query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not supported' });
			} else if (event.multiValueQueryStringParameters) {
				logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not supported' });
			} else if (!event.pathParameters) {
				logger.error('Path parameter must be provided to /flight/:flightId/seats. Details: ' + event);
				return constructResponse(400, { error: 'Flight number required' });
			} else if (!event.pathParameters.flightId) {
				logger.error('Flight number path parameter must be provided to /flight/:flightId/seats. Details: ' + event);
				return constructResponse(400, { error: 'Flight number required' });
			} else {
				const response = {};
				request.get(`${searchEndpoint}/seats?flight=${event.pathParameters.flightId}`,
					{}, handleBackendResponse(response, logger));
				return response;
			}
		} else {
			logger.error('Unsupported method for /flight/:flightNumber/seats. Details: ' + event);
			return constructResponse(405, { error: 'Only GET method supported' });
		}
	},

	oneSeat: function(event) {
		if (event.httpMethod === 'GET') {
			if (event.queryStringParameters) {
				logger.error('Unwanted query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not supported' });
			} else if (event.multiValueQueryStringParameters) {
				logger.error('Unwanted multi-value query parameters provided. Details: ' + event);
				return constructResponse(400, { error: 'Query parameters not supported' });
			} else if (!event.pathParameters) {
				logger.error('Path parameter must be provided to /flight/:flightId/seats. Details: ' + event);
				return constructResponse(400, { error: 'Flight number required' });
			} else if (!event.pathParameters.flightId || !event.pathParameters.row || !event.pathParameters.seatId) {
				logger.error('Flight number path parameter must be provided to /flight/:flightId/seats. Details: ' + event);
				return constructResponse(400, { error: 'Flight number required' });
			} else {
				const response = {};
				request.get(
					`${bookingEndpoint}/details/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`,
					{}, handleBackendResponse(res, logger));
				return response;
			}
		} else {
			logger.error('Unsupported method for /flight/:flightNumber/seats. Details: ' + event);
			return constructResponse(405, { error: 'Only GET method supported' });
		}
	},

	ticketDispatcher: function(event) {
		switch (event.httpMethd) {
			case 'POST':
				return postTicket(event);
			case 'PUT':
				return putTicket(event);
			case 'DELETE':
				return deleteTicket(event);
			default:
				logger.error('Unsupported method for /flight/:flightNumber/seat/:row/:seatId/ticket. Details: ' + event);
				return constructResponse(405, { error: 'Only POST, PUT, and DELETE supported' });
		}
	},

	bookingDispatcher: function(event) {
		switch (event.httpMethod) {
			case 'GET':
				return getBooking(event);
			case 'PUT':
				return putBooking(event);
			case 'DELETE':
				return deleteBooking(event);
			default:
				logger.error('Unsupported method for /booking/:bookingCode. Details: ' + event);
				return constructResponse(405, { error: 'Only GET, PUT, and DELETE supported' });
		}
	}
}

module.exports = router;
