
global.handlingList = {};
function monitorRecord(record, logger) {



}
async function monitorHandler(logger) {

    let pendTime = global.testnet ?  7 * 24 * 60 * 60 * 1000 :  4 * 7 * 24 * 60 * 60 * 1000;
    let option = {

    }


    let history = await global.modelOps.getEventHistory(option);
    logger.debug('monitorHandler history length is ', history.length);
    logger.debug('global.handlingList length is ', Object.keys(global.handlingList).length);

    for (let i = 0; i < history.length; i++) {
        let record = history[i];
        let cur = Date.now();
        if (global.handlingList[record.hashX]) {
            continue;
        }
        global.handlingList[record.hashX] = cur;
        monitorRecord(record, logger);
    }
}

module.exports = {
    monitorHandler,
}