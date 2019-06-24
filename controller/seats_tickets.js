'use strict';
const request = require('request');
const router = require('express').Router();
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const bookingEndpoint = process.env.BOOKING_ENDPOINT;
const cancellationEndpoint = process.env.CANCELLATION_ENDPOINT;

function handleBackendResponse(outgoingResponse) {
	return (err, response, body) => {
		if (err) {
			outgoingResponse.status(500);
			console.log(err);
			outgoingResponse.send();
		} else {
			outgoingResponse.status(response.statusCode);
			outgoingResponse.send(body);
		}
	};
}

router.get('/flight/:flightId/seats', function(req, res) {
        if (!req.params.flightId) {
                res.status(400);
                res.send('Flight number required');
        } else {
		// FIXME: Search service doesn't yet provide this
		request.get(`${searchEndpoint}/seats?flight=${req.params.flightId}`,
                        {}, handleBackendResponse(res));
        }
});

router.get('/flight/:flightId/seat/:row/:seatId', function(req, res) {
        if (!req.params.flightId || !req.params.row || !req.params.seatId) {
                res.status(400);
                res.send('Flight number, row, and seat required');
        } else {
                request.get(
			`${bookingEndpoint}/details/flights/${req.params.flightId}/rows/${req.params.row}/seats/${req.params.seatId}`,
			{}, handleBackendResponse(res));
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
				handleBackendResponse(res));
		} else {
			request.put(
				`${bookingEndpoint}/booking/extend/flights/${req.params.flightId}/rows/${req.params.row}/seats/${req.params.seatId}`,
				{}, handleBackendResponse(res));
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
				handleBackendResponse(res));
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
					console.log(err);
					res.send();
				} else {
					const returned = JSON.parse(body);
					if (!returned.reserved) {
						res.status(204);
						res.send();
					} else if (returned.price) {
						request.delete(
							`${cancellationEndpoint}/cancel/ticket/flight/${req.params.flightId}/row/${req.params.row}/seat/${req.params.seatId}`,
							{}, handleBackendResponse(res));
					} else {
						request.delete(
							`${bookingEndpoint}/booking/book/flights/${req.params.flightId}/rows/${req.params.row}/seats/${req.params.seatId}`,
							{}, handleBackendResponse(res));
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
			handleBackendResponse(res));
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
				{ body: {'price': body.price }}, handleBackendResponse(res));
		} else {
			request.put(`${bookingEndpoint}/booking/extend/bookings/${req.params.bookingCode}`,
				{}, handleBackendResponse(res));
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
					console.log(err);
					res.send();
				} else {
					const returned = JSON.parse(body);
					if (!returned.reserved) {
						res.status(204);
						res.send();
					} else if (returned.price) {
						request.delete(
							`${cancellationEndpoint}/cancel/ticket/booking/${req.params.bookingCode}`,
							{}, handleBackendResponse(res));
					} else {
						request.delete(
							`${bookingEndpoint}/booking/book/bookings/${req.params.bookingCode}`,
							{}, handleBackendResponse(res));
					}
				}
			});
	}
});

module.exports = router;
