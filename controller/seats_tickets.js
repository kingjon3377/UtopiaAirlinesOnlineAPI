'use strict';
const request = require('request');
const router = require('express').Router();
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const bookingEndpoint = process.env.BOOKING_ENDPOINT;
const cancellationEndpoint = process.env.CANCELLATION_ENDPOINT;
const handleBackendResponse = require('../util/handle_backend_response.js');
const logger = require('../util/logger').createLogger('ticketsController');

router.get('/flight/:flightId/seats', function(req, res) {
	if (!req.params.flightId) {
		res.status(400);
		res.send('Flight number required');
	} else {
		request.get(`${searchEndpoint}/seats?flight=${req.params.flightId}`,
			{}, handleBackendResponse(res, logger));
	}
});

router.get('/flight/:flightId/seat/:row/:seatId', function(req, res) {
	if (!req.params.flightId || !req.params.row || !req.params.seatId) {
		res.status(400);
		res.send('Flight number, row, and seat required');
	} else {
		request.get(
			`${bookingEndpoint}/details/flights/${req.params.flightId}/rows/${req.params.row}/seats/${req.params.seatId}`,
			{}, handleBackendResponse(res, logger));
	}
});

router.put('/flight/:flightId/seat/:row/:seatId/ticket', function(req, res) {
	if (!req.params.flightId || !req.params.row || !req.params.seatId) {
		res.status(400);
		res.send('Flight number, row, and seat required');
	} else {
		let body = req.body;
		if (body.price) {
			request.put(
				`${bookingEndpoint}/booking/pay/flights/${req.params.flightId}/rows/${req.params.row}/seats/${req.params.seatId}`,
				{ body: {'price': body.price }},
				handleBackendResponse(res, logger));
		} else {
			request.put(
				`${bookingEndpoint}/booking/extend/flights/${req.params.flightId}/rows/${req.params.row}/seats/${req.params.seatId}`,
				{}, handleBackendResponse(res, logger));
		}
	}
});

router.post('/flight/:flightId/seat/:row/:seatId/ticket', function(req, res) {
	if (!req.params.flightId || !req.params.row || !req.params.seatId) {
		res.status(400);
		res.send('Flight number, row, and seat required');
	} else {
		let body = req.body;
		if (!body.reserver) {
			res.status(400);
			res.send('Reserver required');
		} else {
			request.post(
				`${bookingEndpoint}/booking/book/flights/${req.params.flightId}/rows/${req.params.row}/seats/${req.params.seatId}`,
				{ json: { 'id': body.reserver.id } },
				handleBackendResponse(res, logger));
		}
	}
});

router.delete('/flight/:flightId/seat/:row/:seatId/ticket', function(req, res) {
	if (!req.params.flightId || !req.params.row || !req.params.seatId) {
		res.status(400);
		res.send('Flight number, row, and seat required');
	} else {
		request.get(
			`${bookingEndpoint}/booking/details/flights/${req.params.flightId}/rows/${req.params.row}/seats/${req.params.seatId}`,
			{}, function(err, response, body) {
				if (err) {
					res.status(500);
					logger.error(err);
					res.send();
				} else {
					const returned = JSON.parse(body);
					if (!returned.reserved) {
						res.status(204);
						res.send();
					} else if (returned.price) {
						// DELETE makes more sense, but the cancellation service uses PUT at the moment
						request.put(
							`${cancellationEndpoint}/cancel/ticket/flight/${req.params.flightId}/row/${req.params.row}/seat/${req.params.seatId}`,
							{}, handleBackendResponse(res, logger));
					} else {
						request.delete(
							`${bookingEndpoint}/booking/book/flights/${req.params.flightId}/rows/${req.params.row}/seats/${req.params.seatId}`,
							{}, handleBackendResponse(res, logger));
					}
				}
			});
	}
});

router.get('/booking/:bookingCode', function(req, res) {
	if (!req.params.bookingCode) {
		res.status(400);
		res.send('Booking code required');
	} else {
		request.get(`${bookingEndpoint}/booking/details/bookings/${req.params.bookingCode}`, {},
			handleBackendResponse(res, logger));
	}
});

router.put('/booking/:bookingCode', function(req, res) {
	if (!req.params.bookingCode) {
		res.status(400);
		res.send('Booking code required');
	} else {
		let body = req.body;
		if (body.price) {
			request.put(`${bookingEndpoint}/booking/pay/bookings/${req.params.bookingCode}`,
				{ body: {'price': body.price }}, handleBackendResponse(res, logger));
		} else {
			request.put(`${bookingEndpoint}/booking/extend/bookings/${req.params.bookingCode}`,
				{}, handleBackendResponse(res, logger));
		}
	}
});

router.delete('/booking/:bookingCode', function(req, res) {
	if (!req.params.bookingCode) {
		res.status(400);
		res.send('Booking code required');
	} else {
		request.get(`${bookingEndpoint}/booking/details/bookings/${req.params.bookingCode}`,
			{}, function(err, response, body) {
				if (err) {
					res.status(500);
					logger.error(err);
					res.send();
				} else {
					const returned = JSON.parse(body);
					if (!returned.reserved) {
						res.status(204);
						res.send();
					} else if (returned.price) {
						request.delete(
							`${cancellationEndpoint}/cancel/ticket/booking/${req.params.bookingCode}`,
							{}, handleBackendResponse(res, logger));
					} else {
						request.delete(
							`${bookingEndpoint}/booking/book/bookings/${req.params.bookingCode}`,
							{}, handleBackendResponse(res, logger));
					}
				}
			});
	}
});

module.exports = router;