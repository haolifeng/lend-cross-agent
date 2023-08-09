
const BaseTxParseObj = require('./BaseTxParseObj')

class Type1TxParserObj extends BaseTxParseObj {
    constructor(scAddr, nodeUrl, abi){
        super(scAddr,nodeUrl,abi)
    }
}

module.exports = Type1TxParserObj;