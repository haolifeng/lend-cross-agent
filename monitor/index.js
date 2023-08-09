
const { getWeb3Obj } = require('../chain');
const HandlerTxType2 = require('./handlerTxType2');
const HandlerTxType1 = require('./handlerTxType1');
const HandlerTxType0 = require('./handlerTxType0');

const admin = require('../wallets')
global.handlingList = {};
async function monitorRecord(record, logger) {
    const fromChainType = record.crossFromChainSymobl;
    const txHash = record.uniqueID;

    let web3Obj = getWeb3Obj(fromChainType);

    let txInfo = await web3Obj.getTransaction(txHash);
    if(!txInfo){
        return;
    }

    const txType = txInfo.type;
    let ret;
    switch (txType) {
        case 0:
            console.log('type0 ')
            break;
        case 1:
            console.log('type1')
            break;
        case 2:
            console.log('type2')
            let handler = new HandlerTxType2(record, txInfo, logger);
            ret = await handler.handler(admin);
            if(ret && ret.status === 1){
                global.modelOps.updateDocument(global.modelOps.eventModel,{xHash: record.hashX}, {status: "finish",
                    lendTxhash: ret.hash,
                    eventBlockNumber:ret.BlockNumber});
            }
            break;

        default:
            logger.info('the txtype is not support, txType: ', txType);
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