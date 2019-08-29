'use strict';
const winston = require('winston');

module.exports.createLogger = (serviceName) => winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	defaultMeta: { service: serviceName },
	transports: [
		new winston.transports.File({ filename: 'error.log', level: 'error' }),
		new winston.transports.File({ filename: 'combined.log' })
	]
});
