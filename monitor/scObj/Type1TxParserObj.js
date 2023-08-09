
const BaseTxParseObj = require('./BaseTxParseObj')

class Type1TxParserObj extends BaseTxParseObj {
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
}

module.exports = Type1TxParserObj;