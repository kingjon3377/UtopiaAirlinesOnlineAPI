'use strict';
const request = require('request');
const router = require('express').Router();
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const handleBackendResponse = require('../util/handle_backend_response.js');
const logger = require('../util/logger').createLogger('flightsController');

router.get('/flights', function(req, res) {
	request.get(`${searchEndpoint}/flights`, {}, handleBackendResponse(res, logger));
});

router.get('/flight/:flightId', function(req, res) {
	if (!req.params.flightId) {
		res.status(400);
		res.send('Flight number required');
	} else {
		request.get(`${searchEndpoint}/flightDetails?flight=${req.params.flightId}`, {},
			handleBackendResponse(res, logger));
	}
});

module.exports = router;
