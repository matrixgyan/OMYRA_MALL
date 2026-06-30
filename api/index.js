const server = require('../dist/server.cjs');
const app = server.default || server.app || server;

module.exports = app;
