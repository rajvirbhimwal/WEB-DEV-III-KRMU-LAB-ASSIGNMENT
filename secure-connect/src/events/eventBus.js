const EventEmitter = require('events');

// Single shared emitter used across the whole app
class AppEvents extends EventEmitter {}

module.exports = new AppEvents();
