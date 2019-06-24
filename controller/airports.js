'use strict';
const request = require('request');
const router = require('express').Router();
const searchEndpoint = process.env.SEARCH_ENDPOINT;

router.get('/airports', function(req, res) {
	// FIXME: Search service doesn't yet provide this
	request.get(`${searchEndpoint}/airports`, {}, function(err, response, body) {
		res.status(response.statusCode);
		res.send(body);
	});
});

router.get('/airport/:code', function(req, res) {
	// FIXME: Search service doesn't yet provide this
	if (!req.params.code) {
		res.status(400);
		res.send('Airport code required');
	} else {
		request.get(`${searchEndpoint}/airportDetails?airport=${req.params.code}`,
			{}, function(err, response, body) {
				res.status(response.statusCode);
				res.send(body);
			});
	}
});

module.exports = router;
