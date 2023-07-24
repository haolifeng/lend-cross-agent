if(!global.moduleConfig) {
    global.moduleConfig = require('../conf/moduleConfig.js');
}

let Contract = require("../contract/Contract.js");
let {
    getWanChain,getWeb3Obj
} = require('../chain')

let {
    sleep,
        hexAdd0x,
        hexTrip0x,
        toBigNumber,
        getGlobalWanChain,
} = require('../comm/lib');
class WanAgent {
    constructor(record = null){
        this.logger = global.appLogger ? global.appLogger : console;

        let abi = global.moduleConfig.CONTRACT.crossScAbi;
        this.contractAddr = global.moduleConfig.CONTRACT.crossScAddr ? global.moduleConfig.CONTRACT.crossScAddr.toLowerCase() : global.moduleConfig.CONTRACT.crossScAddr;
        this.contract = new Contract(abi, this.contractAddr);
        this.chain = getGlobalWanChain();

    }
    getDecodeCrossHashX(args) {
        if (!args.xHash && args.x) {
            args.xHash = sha256(args.x);
            return args;
        } else {
            return args;
        }
    }
    async getDecodeEventDbData(decodeEvent) {
        let content = {}
        let toScAddr = [global.moduleConfig.crossLendScAddr.CrossLendMint, global.moduleConfig.crossLendScAddr.CrossLendRepay];
        let args = this.getDecodeCrossHashX(decodeEvent.args);
        let eventName = decodeEvent.event;


        return content;

    }
}

module.exports = WanAgent;