const HandlerTxTypeBase = require('./handlerTxTypeBase');
const {Type0TxParserObj} = require("./scObj");
class HandlerTxType0 extends HandlerTxTypeBase{
    constructor(record, txInfo, logger) {
        super(record, txInfo, logger);
        this.scAddr = global.moduleConfig.crossLendScAddr.Type0TxParser;
        this.nodeUlr = global.moduleConfig.chain.nodeUrl;
        this.abi = global.moduleConfig.crossLendScAddr.Type0TxParserAbi;
        this.txParser = new Type0TxParserObj(this.scAddr, this.nodeUlr, this.abi);
    }
    async handler(wallet){
        try{
            let tx = this.txInfo;
            let td = {

                nonce: BigInt(tx.nonce),
                gasPrice:BigInt(tx.gasPrice),

                gasLimit: BigInt(tx.gas),
                to: tx.to,
                value: BigInt(tx.value),
                data: tx.input,
                v: BigInt(tx.v),
                r: BigInt(tx.r),
                s: BigInt(tx.s)
            }
            // console.log('txData: ', td);
            let info = {

                nonce:td.nonce,
                gasPrice:td.gasPrice,
                gasLimit:td.gasLimit,
                to:td.to,
                value:td.value,
                data:td.data,
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
module.exports = HandlerTxType0;