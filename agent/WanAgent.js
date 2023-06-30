if(!global.moduleConfig) {
    global.moduleConfig = require('../conf/moduleConfig.js');
}

let Contract = require("../contract/Contract.js");

class WanAgent {
    constructor(record){
        this.logger = global.appLogger ? global.appLogger : console;




        let abi = global.moduleConfig.CONTRACT.crossScAbi;
        this.contractAddr = global.moduleConfig.CONTRACT.crossScAddr ? global.moduleConfig.CONTRACT.crossScAddr.toLowerCase() : global.moduleConfig.CONTRACT.crossScAddr;
        this.contract = new Contract(abi, this.contractAddr);
    }
}

module.exports = WanAgent;