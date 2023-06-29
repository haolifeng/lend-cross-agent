const Web3 = require('web3')

class Web3Obj {
    constructor(logger, chainType, nodeUrl){
        this.logger = logger;
        this.nodeUrl = nodeUrl;
        this.chainType = chainType;
        this.web3 = new Web3(new Web3.provider.httpProvider(nodeUrl));
    }
    async getTransaction(txHash) {
        let tx = await this.web3.eth.getTransaction(txHash);
        return tx;
    }
}

