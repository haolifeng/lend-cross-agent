const HandlerTxTypeBase = require('./handlerTxTypeBase');
const {Type1TxParserObj} = require("./scObj");
class HandlerTxType1 extends HandlerTxTypeBase{
    constructor(record, txInfo, logger) {
        super(record, txInfo, logger);
        this.scAddr = global.moduleConfig.crossLendScAddr.Type1TxParser;
        this.nodeUlr = global.moduleConfig.chain.nodeUrl;
        this.abi = global.moduleConfig.crossLendScAddr.Type1TxParserAbi;
        this.txParser = new Type1TxParserObj(this.scAddr, this.nodeUlr, this.abi);
    }
    async handler(wallet){
        try{
            let tx = this.txInfo;
            let accessList = tx.accessList;
            console.log('accessList: ', accessList);


            let comAcclessList = [];
            for(let i = 0 ; i< accessList.length; i++){
                let accessItem = accessList[i];
                console.log('accessItem : ', accessItem);
                let addressK = accessItem.address;
                let storageKey = accessItem.storageKeys;
                comAcclessList.push({
                    addressK: addressK, storageKey: storageKey
                })

            }

            console.log('comAcclessList :', comAcclessList);


            let td = {
                chainId: BigInt(tx.chainId),
                nonce: BigInt(tx.nonce),
                gasPrice: BigInt(tx.gasPrice),
                gasLimit: BigInt(tx.gas),
                to: tx.to,
                value: BigInt(tx.value),
                data: tx.input,
                accessList: comAcclessList,
                v: BigInt(tx.v),
                r: BigInt(tx.r),
                s: BigInt(tx.s)
            }
            // console.log('txData: ', td);
            let info = {
                chainId:td.chainId,
                nonce:td.nonce,
                gasPrice:td.gasPrice,
                gasLimit:td.gasLimit,
                to:td.to,
                value:td.value,
                data:td.data,
                accessList:td.accessList,
                v:td.v,
                r:td.r,
                s:td.s

            }
            let txInputType = this.getInputMethodType();
            let eventType = global.moduleConfig.inputType[txInputType];

            let ret = await this.txParser.handlerTxWanLend(wallet, tx.hash, tx.from, info, this.txType, BigNumber.from(this.record.value),eventType)
            return ret;

        }catch (e) {
            this.logger.error('handlerType2 handler: ', e);
        }
    }
}
module.exports = HandlerTxType1;