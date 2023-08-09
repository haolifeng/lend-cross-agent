
const { getWeb3Obj } = require('../chain');
const HandlerTxType2 = require('./handlerTxType2');
const HandlerTxType1 = require('./handlerTxType1');
const HandlerTxType0 = require('./handlerTxType0');

const { checkUniqeID } = require('./handlerCrossCheck');

const admin = require('../wallets')
global.handlingList = {};
async function monitorRecord(record, logger) {

    try {
        const fromChainType = record.crossFromChainSymobl;
        const txHash = record.uniqueID;

        let isFinish = await checkUniqeID(record.uniqueID);
        if(isFinish){
            global.modelOps.updateDocument(global.modelOps.eventModel, {xHash: record.hashX}, {
                status: "finish"
            });
            if (global.handlingList[record.hashX]) {
                logger.debug("global.handlingList delete already handled hashX", record.hashX);
                delete global.handlingList[record.hashX];
            }
            return;
        }

        let web3Obj = getWeb3Obj(fromChainType);

        let txInfo = await web3Obj.getTransaction(txHash);
        if (!txInfo) {
            if (global.handlingList[record.hashX]) {
                logger.debug("global.handlingList delete already handled hashX", record.hashX);
                delete global.handlingList[record.hashX];
            }
            return;
        }

        const txType = txInfo.type;
        let ret;
        let hander;
        switch (txType) {
            case 0:
                handler = new HandlerTxType0((record, txInfo, logger));
                break;
            case 1:
                handler = new HandlerTxType1((record, txInfo, logger));
                break;
            case 2:
                 handler = new HandlerTxType2(record, txInfo, logger);
                break;
            default:
                logger.info('the txtype is not support, txType: ', txType);
                hander = null;
        }
        if(!handler){
            if (global.handlingList[record.hashX]) {
                logger.debug("global.handlingList delete already handled hashX", record.hashX);
                delete global.handlingList[record.hashX];
            }
            return;
        }
        ret = await handler.handler(admin);
        if (ret && ret.status === 1) {
            global.modelOps.updateDocument(global.modelOps.eventModel, {xHash: record.hashX}, {
                status: "finish",
                lendTxhash: ret.hash,
                eventBlockNumber: ret.BlockNumber
            });
        }
        if(global.handlingList[record.hashX]){
            logger.debug("global.handlingList delete already handled hashX", record.hashX);
            delete global.handlingList[record.hashX];
        }
    }catch (e) {
        if (global.handlingList[record.hashX]) {
            logger.debug("global.handlingList delete already handled hashX", record.hashX);
            delete global.handlingList[record.hashX];
        }
        logger.error(e);
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
                monitorRecord(record, logger);
            }catch (err){
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