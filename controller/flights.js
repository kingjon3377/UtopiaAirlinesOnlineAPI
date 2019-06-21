'use strict';
const request = require('request');
const router = require('express').Router();
const searchEndpoint = process.env.SEARCH_ENDPOINT;

router.get('/flights', function(req, res) {
    // FIXME: Search service doesn't yet provide this
    request.get(searchEndpoint + '/flights', {}, function(err, response, body) {
            res.status(response.statusCode);
            res.send(body);
    });
});

router.get('/flight/:flightId', function(req, res) {
	// FIXME: Search service doesn't yet provide this
        if (!req.params.flightId) {
                res.status(400);
                res.send('Flight number required');
        } else {
                request.get(searchEndpoint + '/flightDetails?flight=' +
                        req.params.flightId, {}, function(err, response, body) {
                                res.status(response.statusCode);
                                res.send(body);
                        });
        }
});

module.exports = router;
