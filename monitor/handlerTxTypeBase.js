const InputDataDecoder = require('ethereum-input-data-decoder');

const abi_crosProxy = require('../abi/abi.CrossDelegate.json');
class HandlerTxTypeBase {
    constructor(record, txInfo,logger) {
        this.record = record;
        this.txInfo = txInfo;
        this.txType = txInfo.type;
        this.logger = logger;
    }
    parseInput(){
        let data = this.txInfo.input;
        const decoder = new InputDataDecoder(abi_crosProxy);

        const result = decoder.decodeData(data);
        return result;
    }
    getInputMethodType(){
        let data = this.txInfo.input;
        const decoder = new InputDataDecoder(abi_crosProxy);

        const result = decoder.decodeData(data);
        return result.method;
    }
}

module.exports = HandlerTxTypeBase;