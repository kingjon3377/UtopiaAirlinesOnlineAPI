const request = require('request');
const router = require('express').Router();
const searchEndpoint = process.env.SEARCH_ENDPOINT;

router.get('/airports', function(req, res) {
    request.get(searchEndpoint + '/airports', {}, function(err, response, body) {
            res.status(response.statusCode);
            res.send(body);
    });
});
