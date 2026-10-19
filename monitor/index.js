
const { getWeb3Obj } = require('../chain');
const HandlerTxType2 = require('./handlerTxType2');
const HandlerTxType1 = require('./handlerTxType1');
const HandlerTxType0 = require('./handlerTxType0');

const { checkUniqeID } = require('./handlerCrossCheck');

const { getAdminWallet } = require('../wallets')
global.handlingList = {};

function releaseHandling(logger, hashX) {
    if (hashX && global.handlingList[hashX]) {
        logger.debug("global.handlingList delete already handled hashX", hashX);
        delete global.handlingList[hashX];
    }
}

async function monitorRecord(record, logger) {
    logger.debug('monitorRecord ----- record: ', record);

    try {
        if (!record || !record.hashX) {
            logger.error('monitorRecord: record without hashX, skipped');
            return;
        }
        const hashX = record.hashX;
        const fromChainType = record.crossFromChainSymobl;
        const txHash = record.uniqueID;

        if (!fromChainType) {
            logger.error('monitorRecord: missing crossFromChainSymobl, hashX: ', hashX);
            releaseHandling(logger, hashX);
            return;
        }
        logger.debug('monitorRecord ----- record.uniqueID: ', record.uniqueID);

        // Fail closed: checkUniqeID throws on RPC/contract errors, and this try
        // block turns that into "release and skip", never into "not finished".
        let isFinish = await checkUniqeID(record.uniqueID);
        logger.debug("monitorRecord --- the record is : ", isFinish)

        if(isFinish){
            // NOTE: the filter field is `hashX`, not `xHash`.
            await global.modelOps.markEventFinished(hashX);
            releaseHandling(logger, hashX);
            return;
        }

        let web3Obj = getWeb3Obj(fromChainType);

        let txInfo = await web3Obj.getTransaction(txHash);
        if (!txInfo) {
            releaseHandling(logger, hashX);
            return;
        }

        const txType = txInfo.type;
        let ret;
        let handler;   // WAS: `hander` typo creating an implicit global
        switch (txType) {
            case 0:
                handler = new HandlerTxType0(record, txInfo, logger);
                break;
            case 1:
                handler = new HandlerTxType1(record, txInfo, logger);
                break;
            case 2:
                 handler = new HandlerTxType2(record, txInfo, logger);
                break;
            default:
                logger.info('the txtype is not support, txType: ', txType);
                handler = null;
        }
        if(!handler){
            releaseHandling(logger, hashX);
            return;
        }
        //ret = await handler.handler(getAdminWallet());
        if (ret && ret.status === 1) {
            const claimed = await global.modelOps.markEventFinished(hashX, {
                lendTxhash: ret.hash,
                eventBlockNumber: ret.blockNumber,
            });
            if (!claimed) {
                logger.error('record was already finished by someone else, possible double execution, hashX: ', hashX);
            }
        }
        releaseHandling(logger, hashX);
    }catch (e) {
        releaseHandling(logger, record && record.hashX);
        logger.error('monitorRecord error: ', e);
    }





}
async function monitorHandler(logger) {

    try{
        let pendTime = global.testnet ?  7 * 24 * 60 * 60 * 1000 :  4 * 7 * 24 * 60 * 60 * 1000;
        let option = {

            hashX: {
                $nin: Object.keys(global.handlingList)
            },
            status:{
                $nin:["finished"]
            }
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
            try{
                // MUST be awaited: without it exceptions never reach this
                // try/catch and every record is retried forever in parallel.
                await monitorRecord(record, logger);
            }catch (err){
                releaseHandling(logger, record.hashX);
                logger.error("monitorRecord err: ", err)
            }

        }
    }catch (error){
        logger.error('monitorHandler, error : ', error)
    }


}

module.exports = {
    monitorHandler,
}