
global.testnet = true;
global.loglevel = 'debug';



global.moduleConfig = require('./conf/moduleConfig.js');

const Logger = require('./comm/logger.js');

global.appLogger = new Logger("lendCrossAgent", "log/lendCrossAgent.log", "log/lendCrossAgent.log", global.loglevel);

