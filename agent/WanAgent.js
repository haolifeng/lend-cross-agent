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
         this.logger.debug("WanAgent -- getPairInfo, tokenPairID ", tokenPairID);
        let tokenPair  = await this.chain.getTokenPair(tokenPairID);
        this.logger.debug('wanAgent -- getPairInfo, tokenPair: ', tokenPair);
        if (tokenPair.fromAccount && tokenPair.toAccount) {
            tokenPair.ancestorChainSymbol = (await getChainSymbolByChainId(tokenPair.ancestorChainID));
            tokenPair.fromChainSymbol = (await getChainSymbolByChainId(tokenPair.fromChainID));
            tokenPair.toChainSymbol = (await getChainSymbolByChainId(tokenPair.toChainID));
        }
        return tokenPair;
    }
    async getDecodeEventDbData(decodeEvent) {

        console.log('decodeEvent: ', decodeEvent);

        let content = {}
        let toScAddr = [global.moduleConfig.crossLendScAddr.CrossLendMint, global.moduleConfig.crossLendScAddr.CrossLendRepay];
        let args = this.getDecodeCrossHashX(decodeEvent.args);
        let eventName = decodeEvent.event;

        let wanEvents = global.moduleConfig.wanEvents;
        if(wanEvents.includes(eventName)){
            let userAccount = decodeEvent.args.userAccount.toLowerCase();
            console.log('userAccount: ', userAccount);
            console.log(global.moduleConfig.crossLendScAddr.CrossLendMint.toLowerCase())
            console.log(global.moduleConfig.crossLendScAddr.CrossLendRepay.toLowerCase())

            if(userAccount === global.moduleConfig.crossLendScAddr.CrossLendMint.toLowerCase() || userAccount === global.moduleConfig.crossLendScAddr.CrossLendRepay.toLowerCase()){
                let tokenPairID = Number(args.tokenPairID);
                console.log('tokenPairID: ', tokenPairID);
                let tokenPair = await this.getPairInfo(tokenPairID);
                console.log('tokenPair is   haolifeng ---- 2000  : ', tokenPair);
                content = {
                    hashX: args.uniqueID,
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
        this.logger.debug('***********************************1: getDecodeEventDbData ********************************** content: ', content);
        return content;

    }
}

module.exports = WanAgent;