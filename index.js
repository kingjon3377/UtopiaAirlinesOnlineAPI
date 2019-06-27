const dotenv = require('dotenv');
dotenv.config();
const logger = require('./util/logger').createLogger('main');

const express = require('express');
const app = express();
app.use(express.json());
app.use(require('./controller/airports'));
app.use(require('./controller/flights'));
app.use(require('./controller/seats_tickets'));
const server = app.listen(9000);
logger.info('Server running on port 9000');
module.exports = server;
module.exports.stop = async function(done) {
	await server.close();
	done();
};
