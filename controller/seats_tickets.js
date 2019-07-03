'use strict';
const got = require('got');
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const bookingEndpoint = process.env.BOOKING_ENDPOINT;
const cancellationEndpoint = process.env.CANCELLATION_ENDPOINT;
const logger = require('../util/logger').createLogger('ticketsController');
const constructResponse = require ('../util/construct_response');

async function putTicket(event) {
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
		if (body.price) {
			const resp = await got.put(
				`${bookingEndpoint}/booking/pay/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`,
				{ body: {'price': body.price }});
			return constructResponse(resp.statusCode, resp.body);
		} else {
			const resp = await got.put(
				`${bookingEndpoint}/booking/extend/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`);
			return constructResponse(resp.statusCode, resp.body);
		}
	}
}

async function postTicket(event) {
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
			const resp = await got.put(
				// FIXME: Should call "book", not "pay"
				`${bookingEndpoint}/booking/pay/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`,
				{ body: `{ 'id': ${body.reserver.id} }` });
			return constructResponse(resp.statusCode, resp.body);
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
		let response = {};
		const firstResult = got(
			`${bookingEndpoint}/booking/details/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`);
		firstResult.then(async (result) => {
			const body = result.body;
			if (!body.reserved) {
				response = constructResponse(204, '');
			} else if (body.price) {
				// DELETE makes more sense, but the cancellation service uses PUT at the moment
				const secondResult = await got.put(
					`${cancellationEndpoint}/cancel/ticket/flight/${event.pathParameters.flightId}/row/${event.pathParameters.row}/seat/${event.pathParameters.seatId}`);
				response = constructResponse(secondResult.statusCode, secondResult.body);
			} else {
				const secondResult = await got.delete(
					`${bookingEndpoint}/booking/book/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`);
				response = constructResponse(secondResult.statusCode, secondResult.body);
			}
		}, (err) => {
			response = constructResponse(500, { error: 'Error in backend service' });
			logger.error(err);
		});
		return response;
	}
}

async function getBooking(event) {
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
		const resp = await got(`${bookingEndpoint}/booking/details/bookings/${event.pathParameters.bookingCode}`);
		return constructResponse(resp.statusCode, resp.body);
	}
}

async function putBooking(event) {
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
			const resp = await got.put(`${bookingEndpoint}/booking/details/bookings/${event.pathParameters.bookingCode}`,
				{ body: `{'price': ${body.price} }` });
			return constructResponse(resp.statusCode, resp.body);
		} else {
			const resp = await got.put(`${bookingEndpoint}/booking/extend/bookings/${event.pathParameters.bookingCode}`);
			return constructResponse(resp.statusCode, resp.body);
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
		let response = {};
		const firstResult = got(`${bookingEndpoint}/booking/details/bookings/${event.pathParameters.bookingCode}`);
		firstResult.then(async (result) => {
			const body = result.body;
			if (!body.reserved) {
				response = constructResponse(204, '');
			} else if (body.price) {
				// DELETE makes more sense, but the cancellation service uses PUT at the moment
				const secondResult = await got.put(
					`${cancellationEndpoint}/cancel/ticket/booking/${event.pathParameters.bookingCode}`);
				response = constructResponse(secondResult.statusCode, secondResult.body);
			} else {
				const secondResult = await got.delete(
					`${bookingEndpoint}/booking/book/bookings/${event.pathParameters.bookingCode}`);
				response = constructResponse(secondResult.statusCode, secondResult.body);
			}
		}, (err) => {
			response = constructResponse(500, { error: 'Error in backend service' });
			logger.error(err);
		});
		return response;
	}
}

module.exports = {
	allSeatsOnFlight: async function(event) {
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
				const resp = await got(`${searchEndpoint}/seats?flight=${event.pathParameters.flightId}`);
				return constructResponse(resp.statusCode, resp.body);
			}
		} else {
			logger.error('Unsupported method for /flight/:flightNumber/seats. Details: ' + event);
			return constructResponse(405, { error: 'Only GET method supported' });
		}
	},

	oneSeat: async function(event) {
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
				const resp = await got(
					`${bookingEndpoint}/details/flights/${event.pathParameters.flightId}/rows/${event.pathParameters.row}/seats/${event.pathParameters.seatId}`);
				return constructResponse(resp.statusCode, resp.body);
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
};
