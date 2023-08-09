
const BaseTxParseObj = require('./BaseTxParseObj')

class Type2TxParserObj extends BaseTxParseObj {
    constructor(scAddr, nodeUrl, abi){
        super(scAddr,nodeUrl,abi)
    }
    async handlerTxWanLend(wallet,  uniquID,  from,    info, txType ,actualValue, eventType){
        let singer = wallet.connect(this.provider);
        let signedWallet = this.scInst.connect(singer);
        let tx = await signedWallet.handlerTxWanLend(uniquID,from, info,  txType,actualValue,eventType, {
            gasLimit:'5000000'
        });
        let ret = await tx.wait();
        return ret;
    }
    async hash(info, txType){
        let hashBytes = await this.scInst.hash(info, txType);
        return hashBytes;
    }
    async getSender(info, txType){
        let sender = await this.scInst.getSender(info, txType);
        return sender;
    }

}

module.exports = Type2TxParserObj;