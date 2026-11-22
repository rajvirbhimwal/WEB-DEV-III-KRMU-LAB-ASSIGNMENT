const EventEmitter = require("events");
const appEvents = new EventEmitter();
appEvents.setMaxListeners(30);

module.exports = appEvents;
