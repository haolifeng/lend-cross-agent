
global.testnet = true;
global.loglevel = 'debug';



global.moduleConfig = require('./conf/moduleConfig.js');

const Logger = require('./comm/logger.js');

global.appLogger = new Logger("lendCrossAgent", "log/lendCrossAgent.log", "log/lendCrossAgent.log", global.loglevel);

global.modelOps = require('./db');

let { syncChain } = require('./chain');


async function handlerMain(logger) {
    while(1){
        await monitorHandler(logger);
        await sleep(global.moduleConfig.INTERVAL_TIME);
    }
}

main();