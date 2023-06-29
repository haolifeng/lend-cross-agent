"use strict"

const mongoose = require('mongoose');
const ModelOps = require('../db/modelOps');



let crossDbUrl = global.moduleConfig.dbUrl;
let dbOption = {
  autoReconnect: true,
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 100,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 360000
}
let dbUrl = crossDbUrl;



//dbUrl = dbUrl + "?authSource=admin";

global.dbUrl = dbUrl;
global.dbOption = dbOption;

let db = mongoose.createConnection(dbUrl, dbOption);

db.on('connected', function(err) {
  if (err) {
    global.appLogger.error('Unable to connect to database(' + crossDbUrl.split('/')[3]  + ')：' + err);
    global.appLogger.error('Aborting');
    process.exit();
  } else {
    global.appLogger.info('Connecting to database ' + crossDbUrl.split('/')[3] + ' is successful!');
  }
});

db.on("reconnected", () => {
  global.appLogger.warn('Reconnecting to database ' + crossDbUrl.split('/')[3] );
});

db.on("error", (err) => {
  global.appLogger.error('Connecting to database ' + crossDbUrl.split('/')[3] +  ' failed!');
  global.appLogger.error(err);
  if (err.message && err.message.match(/failed to connect to server .* on first connect/)) {
    setTimeout(function () {
      global.appLogger.debug("Retrying first connect...");
      db.openUri(dbUrl, dbOption);
    }, 5 * 1000)
  } else {
    global.appLogger.error('Connecting to database ' + crossDbUrl.split('/')[3] +  'Aborting!');
    process.exit(1);
  }
});
db.on("parseError", (err) => {
  global.appLogger.error('Connected database ' + crossDbUrl.split('/')[3] +  ' :ParseError happened');
  global.appLogger.error(err);
  global.appLogger.error("Aborting!");
  // process.exit(1);
});
db.on("disconnected", () => {
  global.appLogger.warn('Connected database ' + crossDbUrl.split('/')[3] +  ' :disconnected happened');
});
db.on("reconnectFailed", (err) => {
  global.appLogger.error('Connected database ' + crossDbUrl.split('/')[3] +  ' :reconnectFailed happened', err);
});
db.on("reconnectTries", () => {
  global.appLogger.error('Connected database ' + crossDbUrl.split('/')[3] +  ' :reconnectFailed happened, and no longer attempt to reconnect');
});
db.on("close", () => {
  global.appLogger.info('Connected database ' + crossDbUrl.split('/')[3] +  '::connect:Close happened');
  process.exit(1);
});

let modelOps = new ModelOps(global.appLogger, db);

module.exports = modelOps;