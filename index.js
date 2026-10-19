
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
const { assertAdminWallet } = require('./wallets')

// A missing/zero interval turned the main loop into a busy loop hammering the
// RPC nodes and MongoDB. Never trust the config value blindly.
const DEFAULT_INTERVAL_TIME = 10 * 1000;
const INTERVAL_TIME = Number(global.moduleConfig.INTERVAL_TIME) > 0
    ? Number(global.moduleConfig.INTERVAL_TIME)
    : DEFAULT_INTERVAL_TIME;

async function handlerMain(logger) {
    while(1){
        await monitorHandler(logger);
        await sleep(INTERVAL_TIME);
    }
}
async function syncWanChain(logger){

    while(1){
        await syncChain(logger);
        await sleep(INTERVAL_TIME);
    }
}
// A silent crash is the worst failure mode for a signer: a floating promise
// rejection would leave the process half-dead while looking healthy.
process.on('unhandledRejection', (reason) => {
    global.appLogger.error("unhandledRejection: ", reason);
});
process.on('uncaughtException', (err) => {
    global.appLogger.error("uncaughtException: ", err);
    process.exit(1);
});

async function  main(){
    try{
        // Fail fast: refuse to start without a usable administrator wallet.
        assertAdminWallet();

        //syncWanChain(global.appLogger);
        handlerMain(global.appLogger).catch((e) => {
            global.appLogger.error("handlerMain aborted,e: ", e);
            process.exit(1);
        });
    }catch (e) {
        global.appLogger.error("main start,e: ", e);
        process.exit(1);
    }

}
main();