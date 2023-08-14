
global.testnet = true;
global.loglevel = 'debug';



global.moduleConfig = require('./config/moduleConfig.js');

const Logger = require('./comm/logger.js');

global.appLogger = new Logger("lendCrossAgent", "log/lendCrossAgent.log", "log/lendCrossAgent.log", global.loglevel);

global.modelOps = require('./db');
global.wanChain = null;
let {initWanChain, syncChain } = require('./chain');

initWanChain();

const {
    sleep,
    getGlobalWanChain
} = require('./comm/lib')
const { monitorHandler } = require('./monitor')

async function handlerMain(logger) {
    while(1){
        await monitorHandler(logger);
        await sleep(global.moduleConfig.INTERVAL_TIME);
    }
}
async function syncWanChain(logger){

    while(1){
        await syncChain(logger);
        await sleep(global.moduleConfig.INTERVAL_TIME);
    }
}
async function  main(){
    try{

        //syncWanChain(global.appLogger);
        handlerMain(global.appLogger);
    }catch (e) {
        global.appLogger.error("main start,e: ", e);
        process.exit(0);
    }

}
main();