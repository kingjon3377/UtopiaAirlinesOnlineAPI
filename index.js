const dotenv = require('dotenv');
dotenv.config();
const logger = require('./util/logger').createLogger('main');
const pathToRegexp = require('path-to-regexp');
const airportController = require('./controller/airports');
const flightController = require('./controller/flights');
const ticketController = require('./controller/seats_tickets');

exports.handler = async (event) => {
	if (!event) {
		logger.error('Null event');
		return null;
	} else (!event.resource) {
		logger.error('Event with null resource. Full details: ' + JSON.stringify(event));
		return null;
	}
	switch (event.resource) {
		case '/airports':
			return airportController.allAirports(event);
		case '/airport/{code}':
			return airportController.oneAirport(event);
		case '/flights':
			return flightController.allFlights(event);
		case '/flight/{flightId}':
			return flightController.oneFlight(event);
		case '/flight/{flightId}/seats':
			return ticketController.allSeatsOnFlight(event);
		case '/flight/{flightId}/seat/{row}/{seatId}':
			return ticketController.oneSeat(event);
		case '/flight/{flightId}/seat/{row}/{seatId}/ticket':
			return ticketController.ticketDispatcher(event);
		case '/booking/{bookingCode}':
			return ticketController.bookingDispatcher(event);
		default:
			logger.error('Unhandled route! Event details: ' + JSON.stringify(event));
			return null;
	}
}
