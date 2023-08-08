
global.testnet = true;
global.loglevel = 'debug';



global.moduleConfig = require('./conf/moduleConfig.js');

const Logger = require('./comm/logger.js');

global.appLogger = new Logger("lendCrossAgent", "log/lendCrossAgent.log", "log/lendCrossAgent.log", global.loglevel);

global.modelOps = require('./db');

let {initWanChain, syncChain } = require('./chain');

initWanChain();

const {
    sleep,
    getGlobalWanChain
} = require('./comm/lib')


async function handlerMain(logger) {
    while(1){
        await monitorHandler(logger);
        await sleep(global.moduleConfig.INTERVAL_TIME);
    }
}
async function syncWanChain(logger){
    const chainType = "WAN";
    while(1){
        await syncChain(logger);
        await sleep(global.moduleConfig.INTERVAL_TIME);
    }
}
async function  main(){
    try{

        syncWanChain(global.appLogger);
        //handlerMain(global.appLogger);
    }catch (e) {
        global.appLogger.error("main start,e: ", e);
        process.exit(0);
    }

}
main();