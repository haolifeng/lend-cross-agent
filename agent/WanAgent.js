if(!global.moduleConfig) {
    global.moduleConfig = require('../conf/moduleConfig.js');
}

let Contract = require("../contract/Contract.js");


let {
    sleep,
        hexAdd0x,
        hexTrip0x,
        toBigNumber,
        getGlobalWanChain,
    getChainSymbolByChainId
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
    getDecodeEventToHtlcAddr(decodeEvent) {
        return decodeEvent.address;
    }

    getDecodeCrossAddress(decodeEvent) {
        return decodeEvent.args.userAccount;
    }
    async getPairInfo(tokenPairID) {

        let tokenPair  = this.chain.getTokenPair(tokenPairID);
        if (tokenPair.fromAccount && tokenPair.toAccount) {
            tokenPair.ancestorChainSymbol = (await getChainSymbolByChainId(tokenPair.ancestorChainID));
            tokenPair.fromChainSymbol = (await getChainSymbolByChainId(tokenPair.fromChainID));
            tokenPair.toChainSymbol = (await getChainSymbolByChainId(tokenPair.toChainID));
        }
    }
    async getDecodeEventDbData(decodeEvent) {

        console.log('decodeEvent: ', decodeEvent);

        let content = {}
        let toScAddr = [global.moduleConfig.crossLendScAddr.CrossLendMint, global.moduleConfig.crossLendScAddr.CrossLendRepay];
        let args = this.getDecodeCrossHashX(decodeEvent.args);
        let eventName = decodeEvent.event;

        let wanEvents = global.moduleConfig.wanEvents;
        if(wanEvents.includes(eventName)){
            let userAccount = decodeEvent.args.userAccount;
            if(userAccount === global.moduleConfig.crossLendScAddr.CrossLendMint || userAccount === global.moduleConfig.crossLendScAddr.CrossLendRepay){
                let tokenPairID = Number(args.tokenPairID);
                let tokenPair = await this.getPairInfo(tokenPairID);
                console.log('tokenPair is : ', tokenPair);
                content = {
                    crossAddress: this.getDecodeCrossAddress(decodeEvent),
                    toHtlcAddr: this.getDecodeEventToHtlcAddr(decodeEvent),
                    tokenAddr: args.tokenAccount.toLowerCase(),
                    tokenPairID: tokenPairID,
                }
            }
        }

        function compare(p) {
            return function (m, n) {
                var a = m[p];
                var b = n[p];
                return b - a;
            }
        }

        this.logger.debug("********************************** 0: getDecodeEventDbData ********************************** eventName:", eventName, decodeEvent.transactionHash);
        return content;

    }
}

module.exports = WanAgent;