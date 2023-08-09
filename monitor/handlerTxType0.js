const HandlerTxTypeBase = require('./handlerTxTypeBase');
class HandlerTxType0 extends HandlerTxTypeBase{
    constructor(record, txInfo, logger) {
        super(record, txInfo, logger);
    }
}
module.exports = HandlerTxType0;