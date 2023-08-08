const HandlerTxTypeBase = require('./handlerTxTypeBase');
class HandlerTxType1 extends HandlerTxTypeBase{
    constructor(record, txInfo) {
        super(record, txInfo);
    }
}
module.exports = HandlerTxType1;