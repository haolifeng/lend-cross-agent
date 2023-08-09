const HandlerTxTypeBase = require('./handlerTxTypeBase');
class HandlerTxType1 extends HandlerTxTypeBase{
    constructor(record, txInfo, logger) {
        super(record, txInfo, logger);
    }
}
module.exports = HandlerTxType1;