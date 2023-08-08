const HandlerTxTypeBase = require('./handlerTxTypeBase');

const { Type2TxParserObj } = require('./scObj');
const {BigNumber} = require("ethers");
class HandlerTxType2 extends HandlerTxTypeBase{
    constructor(record, txInfo, logger) {
        super(record, txInfo, logger);
        this.scAddr = global.moduleConfig.crossLendScAddr.Type2TxParser;
        this.nodeUlr = global.moduleConfig.chain.nodeUrl;
        this.abi = global.moduleConfig.CONTRACT.Type2TxParser2Abi;
        this.txParser = new Type2TxParserObj(this.scAddr, this.nodeUlr, this.abi);
    }
    async handler(wallet){
        try{
            let accessList = tx.accessList;
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
                maxPriorityFeePerGas: BigInt(tx.maxPriorityFeePerGas),
                maxFeePerGas: BigInt(tx.maxFeePerGas),
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
                maxPriorityFeePerGas:td.maxPriorityFeePerGas,
                maxFeePerGas:td.maxFeePerGas,
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
        }catch (e){
            this.logger.error('handlerType2 handler: ', e);
        }



    }
}
module.exports = HandlerTxType2;