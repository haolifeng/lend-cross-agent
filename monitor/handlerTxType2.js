const HandlerTxTypeBase = require('./handlerTxTypeBase');

const { Type2TxParserObj } = require('./scObj');
class HandlerTxType2 extends HandlerTxTypeBase{
    constructor(record, txInfo) {
        super(record, txInfo);
    }
    async handler(){
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
        let inputType = global.moduleConfig.inputType[txInputType];


    }
}
module.exports = HandlerTxType2;