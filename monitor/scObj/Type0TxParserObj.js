
const BaseTxParseObj = require('./BaseTxParseObj')

class Type0TxParserObj extends BaseTxParseObj {
    constructor(scAddr, nodeUrl, abi){
        super(scAddr,nodeUrl,abi)
    }
}

module.exports = Type0TxParserObj;