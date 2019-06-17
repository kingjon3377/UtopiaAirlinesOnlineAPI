const request = require('request');
const router = require('express').Router();
const searchEndpoint = process.env.SEARCH_ENDPOINT;

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
                request.get(searchEndpoint + '/ticket?flight=' +
                        req.params.flightId + '&row=' + req.params.row +
                        '&seat=' + req.params.seatId, {}, function(err, response, body) {
                                res.status(response.statusCode);
                                res.send(body);
                        });
        }
});

