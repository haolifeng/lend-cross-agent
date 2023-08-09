const Web3_v2 = require('web3_1.2');

class Web3Obj {
    constructor(logger, chainType, nodeUrl){
        this.logger = logger;
        this.nodeUrl = nodeUrl;
        this.chainType = chainType;
        this.web3 = new Web3_v2(new Web3_v2.provider.httpProvider(nodeUrl));
    }
    async getTransaction(txHash) {
        let tx = await this.web3.eth.getTransaction(txHash);
        return tx;
    }
}
module.exports = Web3Obj;

