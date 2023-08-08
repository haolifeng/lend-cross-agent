const HandlerTxTypeBase = require('./handlerTxTypeBase');
class HandlerTxType0 extends HandlerTxTypeBase{
    constructor(record, txInfo) {
        super(record, txInfo);
    }
}
module.exports = HandlerTxType0;