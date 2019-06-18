'use strict';
const request = require('request');
const router = require('express').Router();
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const bookingEndpoint = process.env.BOOKING_ENDPOINT;
const cancellationEndpoint = process.env.CANCELLATION_ENDPOINT;

router.get('/flight/:flightId/seats', function(req, res) {
        if (!req.params.flightId) {
                res.status(400);
                res.send('Flight number required');
        } else {
                request.get(searchEndpoint + '/seats?flight=' +
                        req.params.flightId, {}, function(err, response, body) {
                                res.status(response.statusCode);
                                res.send(body);
                        });
        }
});

router.get('/flight/:flightId/seat/:row/:seatId', function(req, res) {
        if (!req.params.flightId || !req.params.row || !req.params.seatId) {
                res.status(400);
                res.send('Flight number, row, and seat required');
        } else {
                request.get(searchEndpoint + '/seat?flight=' +
                        req.params.flightId + '&row=' + req.params.row +
                        '&seat=' + req.params.seatId, {}, function(err, response, body) {
                                res.status(response.statusCode);
                                res.send(body);
                        });
        }
});

router.get('/flight/:flightId/seat/:row/:seatId', function(req, res) {
        if (!req.params.flightId || !req.params.row || !req.params.seatId) {
                res.status(400);
                res.send('Flight number, row, and seat required');
        } else {
			// TODO: Switch to booking service for this; search service filters out booked tickets.
                request.get(searchEndpoint + '/ticket?flight=' +
                        req.params.flightId + '&row=' + req.params.row +
                        '&seat=' + req.params.seatId, {}, function(err, response, body) {
                                res.status(response.statusCode);
                                res.send(body);
                        });
        }
});

router.put('/flight/:flightId/seat/:row/:seatId/ticket', function(req, res) {
        if (!req.params.flightId || !req.params.row || !req.params.seatId) {
                res.status(400);
                res.send('Flight number, row, and seat required');
        } else {
                // TODO: Make sure to call app.use(express.json()) in index.js
                let body = req.body;
		if (body.price) {
			request.put(bookingEndpoint + '/booking/pay/flights/' +
				req.params.flightId + '/rows/' + req.params.row + '/seats/' +
				req.params.seatId, { body: {'price': body.price }},
				function(err, response, body) {
					res.status(response.statusCode);
					res.send(body);
				});
		} else {
			request.put(bookingEndpoint + '/booking/extend/flights/' +
				req.params.flightId + '/rows/' + req.params.row +
				'/seats/' + req.params.seatId, {}, function(err, response, body) {
					res.status(response.statusCode);
					res.send(body);
				});
		}
	}
});

router.post('/flight/:flightId/seat/:row/:seatId/ticket', function(req, res) {
        if (!req.params.flightId || !req.params.row || !req.params.seatId) {
                res.status(400);
                res.send('Flight number, row, and seat required');
        } else {
                // TODO: Make sure to call app.use(express.json()) in index.js
                let body = req.body;
		if (!body.reserver) {
			res.status(400);
			res.send('Reserver required');
		} else {
			request.post(bookingEndpoint + '/booking/book/flights/' +
				req.params.flightId + '/rows/' + req.params.row +
				'/seats/' + req.params.seatId, body.reserver,
				function(err, response, body) {
					res.status(response.statusCode);
					res.send(body);
				});
		}
	}
});

router.delete('/flight/:flightId/seat/:row/:seatId/ticket', function(req, res) {
        if (!req.params.flightId || !req.params.row || !req.params.seatId) {
                res.status(400);
                res.send('Flight number, row, and seat required');
        } else {
		request.get(bookingEndpoint + '/booking/details/flights/' + req.params.flightId +
			'/rows/' + req.params.row + '/seats/' + req.params.seatId, {},
			function(err, response, body) {
				const returned = JSON.parse(body);
				if (!returned.reserved) {
					res.status(204);
					res.send();
				} else if (returned.price) {
					request.delete(cancellationEndpoint + '/cancel/ticket/flight/' +
						req.params.flightId + '/row/' + req.params.row + '/seat/' +
						req.params.seatId, {}, function(err, response, body) {
							res.status(response.statusCode);
							res.send(body);
					});
				} else {
					request.delete(bookingEndpoint + '/booking/book/flights/' +
						req.params.flightId + '/rows/' + req.params.row + '/seats/' +
						req.params.seatId, {}, function(err, response, body) {
							res.status(response.statusCode);
							res.send(body);
					});
				}
			});
	}
});

router.get('/booking/:bookingCode', function(req, res) {
	if (!req.params.bookingCode) {
		res.status(400);
		res.send('Booking code required');
	} else {
		request.get(bookingEndpoint + '/booking/details/bookings/' + req.params.bookingCode, {},
			function (err, response, body) {
				res.status(response.statusCode);
				res.send(body);
			});
	}
});

router.put('/booking/:bookingCode', function(req, res) {
	if (!req.params.bookingCode) {
		res.status(400);
		res.send('Booking code required');
	} else {
        // TODO: Make sure to call app.use(express.json()) in index.js
        let body = req.body;
		if (body.price) {
			request.put(bookingEndpoint + '/booking/pay/bookings/' +
				req.params.bookingCode, { body: {'price': body.price }},
				function(err, response, body) {
					res.status(response.statusCode);
					res.send(body);
				});
		} else {
			request.put(bookingEndpoint + '/booking/extend/bookings/' +
				req.params.bookingCode, {}, function(err, response, body) {
					res.status(response.statusCode);
					res.send(body);
				});
		}
	}
});

router.delete('/booking/:bookingCode', function(req, res) {
	if (!req.params.bookingCode) {
			res.status(400);
			res.send('Booking code required');
	} else {
		request.get(bookingEndpoint + '/booking/details/bookings/' + req.params.bookingCode, {},
		function(err, response, body) {
			const returned = JSON.parse(body);
			if (!returned.reserved) {
				res.status(204);
				res.send();
			} else if (returned.price) {
				request.delete(cancellationEndpoint + '/cancel/ticket/booking/' +
					req.params.bookingCode, {}, function(err, response, body) {
						res.status(response.statusCode);
						res.send(body);
				});
			} else {
				request.delete(bookingEndpoint + '/booking/book/bookings/' +
					req.params.bookingCode, {}, function(err, response, body) {
						res.status(response.statusCode);
						res.send(body);
				});
			}
		});
}
});
