if(!global.moduleConfig) {
    global.moduleConfig = require('../conf/moduleConfig.js');
}
const TimeoutPromise = require('../utils/timeoutPromise.js')
const Web3 = require('web3');
const Web3_v2 = require('web3_1.2');

function sleep(time) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, time);
    })
}

class WanChain {
    constructor(log, nodeUrl){
        this.log = log ? log: console;
        this.nodeUrl = nodeUrl;
        this.chainType = "WAN";
        this.getConfig();
        this.client = this.getClient(nodeUrl);
    }
    getClient(nodeUrl){
        return new Web3_v2(new Web3.providers.HttpProvider(nodeUrl));
    }

    getConfig() {
        this.safe_block_num = global.moduleConfig.chain.SAFE_BLOCK_NUM;
        this.confirm_block_num =  global.moduleConfig.chain.CONFIRM_BLOCK_NUM;
        this.checkIrreversible =  global.moduleConfig.chain.checkIrreversible;
        this.trace_block_num = global.moduleConfig.chain.TRACE_BLOCK_NUM;
        this.sync_interval_block_num = global.moduleConfig.chain.SYNC_INTERVAL_BLOCK_NUM;
    }
    getBlockByNumber(blockNumber, callback) {
        this.client.eth.getBlock(blockNumber, callback);
    }
    getBlockByNumberSync(blockNumber) {
        // let log = this.log;
        let self = this;
        let client = this.client;
        let chainType = this.chainType;

        return new TimeoutPromise(function (resolve, reject) {
            try {
                self.getBlockByNumber(blockNumber, function(err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        // log.debug("ChainType:", chainType, 'getBlockByNumberSync successfully with result: ', result);
                        resolve(result);
                    }
                });
            } catch (err) {
                reject(err);
            }
        }, global.moduleConfig.promiseTimeout, "ChainType: " + chainType + ' getBlockByNumberSync timeout');
    }
    getBlockNumberSync() {
        let log = this.log;
        let client = this.client;
        let chainType = this.chainType;

        return new TimeoutPromise(function (resolve, reject) {
            try {
                client.eth.getBlockNumber(function(err, blockNumber) {
                    if (err) {
                        reject(err);
                    } else {
                        log.debug("ChainType:", chainType, 'getBlockNumberSync successfully with result: ', blockNumber);
                        resolve(blockNumber);
                    }
                });
            } catch (err) {
                reject(err);
            }
        }, global.moduleConfig.promiseTimeout, "ChainType: " + chainType + ' getBlockNumberSync timeout');
    }
    sendRawTransaction(signedTx, callback) {
        this.log.debug("======================================== sendRawTransaction ====================================", this.chainType)
        this.client.eth.sendRawTransaction(signedTx, callback);
    }

    sendRawTransactionSync(signedTx) {
        let log = this.log;
        let client = this.client;
        let chainType = this.chainType;
        let self = this;
        return new TimeoutPromise(function (resolve, reject) {
            try {
                self.sendRawTransaction(signedTx, function(err, txHash) {
                    if (err) {
                        log.error("ChainType:", chainType, "sendRawTransactionSync error: ", err, txHash);
                        if (chainType === 'TLOS' && err.indexOf("VM Exception") >= 0) {
                            log.warn("ChainType:", chainType, 'sendRawTransactionSync successfully with signedTx: ', signedTx, ' but failed', txHash, (err.hasOwnProperty("message") ? err.message : err));
                            resolve(txHash);
                        } else {
                            reject((err.hasOwnProperty("message") ? err.message : err));
                        }
                    } else{
                        log.debug("ChainType:", chainType, 'sendRawTransactionSync successfully with signedTx: ', signedTx);
                        resolve(txHash);
                    }
                });
            } catch (err) {
                log.error("ChainType:", chainType, "sendRawTransactionSync error: ", err);
                reject((err.hasOwnProperty("message") ? err.message : err));
            }
        }, global.moduleConfig.promiseTimeout, "ChainType: " + chainType + ' sendRawTransactionSync timeout');
    }
    getScEventSync(address, topics, fromBlk = 0, toBlk = 'latest') {

        fromBlk = 27197496;
        toBlk = fromBlk + 1;

        let clientV2 = this.getClient(this.nodeUrl);
        let baseChain = this;
        let chainType = this.chainType;
        // let times = 0;

        return new TimeoutPromise(async function (resolve, reject) {

            let filterValue = {
                fromBlock: fromBlk,
                toBlock: toBlk,
                topics: topics,
                address: address
            };

            try {
                let result = await clientV2.eth.getPastLogs(filterValue);
                resolve(result);
            } catch (err) {
                baseChain.log.error("ChainType:", chainType, "getScEventSync", err);
                reject((err.hasOwnProperty("message") ? err.message : err));
            }
        }, global.moduleConfig.promiseTimeout, "ChainType: " + chainType + ' getScEventSync timeout');
    }
    async getTransaction(txHash) {
        try {
            let tx = await this.client.eth.getTransaction(txHash);
            return tx;
        }catch (e) {
            this.log.error('WanChain, getTransaction e: ', e);
        }

    }

    async getTokenPair(pairId) {
        let self = this;
        return new TimeoutPromise(async (resolve, reject) => {
            try {
                let tokenPair = await self.getTokenPairInfo(pairId);
                self.log.debug(('haolifeng 30000 --- in wanchain getTokenPair:  ', tokenPair));
                let pairAncestorInfo = await self.getTokenPairAncestorInfo(pairId);

                tokenPair.ancestorAccount = pairAncestorInfo.account;
                tokenPair.ancestorName = pairAncestorInfo.name;
                tokenPair.ancestorSymbol = pairAncestorInfo.symbol;
                tokenPair.ancestorDecimals = pairAncestorInfo.decimals;
                tokenPair.ancestorChainID = pairAncestorInfo.chainId.toString();
                tokenPair.fromChainID = tokenPair.fromChainID.toString();
                tokenPair.toChainID = tokenPair.toChainID.toString();
                tokenPair.tokenCrossType = await self.getTokenCrossType(pairId);
                resolve(tokenPair);
            } catch (err) {
                return reject(err);
            }
        }, global.moduleConfig.promiseTimeout, "ChainType: " + self.chainType + ' getTokenPairInfo timeout');
    }
    getSolInterfaceV2(abi, contractAddr, contractFunc) {
        let clientV2 = this.getClient(this.nodeUrl);
        let contract = new clientV2.eth.Contract(abi, contractAddr);
        return contract.methods[contractFunc];
    }
    getTokenPairInfo(pairId) {
        this.log.debug("WanChain getTokenPairInfo: pairId: ", pairId);
        let self = this;
        let contractAbi = global.moduleConfig.CONTRACT.tokenManagerAbi;
        let contractAddr = global.moduleConfig.CONTRACT.tokenManagerAddr;
        let scFunc = 'getTokenPairInfo';

        return new TimeoutPromise((resolve, reject) => {
            let func = self.getSolInterfaceV2(contractAbi, contractAddr, scFunc);

            func(pairId).call((err, result) => {
                //console.log('haolifeng result: ', JSON.stringify(result));
                if (err) {
                    return reject(err);
                } else {
                    if (result && Object.keys(result).length) {
                        let length = Object.keys(result).length / 2;
                        for (let i = 0; i < length; i++) {
                            delete result[i.toString()];
                        }
                    }
                    return resolve(result);
                }
            });
        }, global.moduleConfig.promiseTimeout, "ChainType: " + self.chainType + ' getTokenPairInfo timeout');
    }
    getTokenPairAncestorInfo(pairId) {
        let self = this;
        let contractAbi = global.moduleConfig.CONTRACT.tokenManagerAbi;
        let contractAddr = global.moduleConfig.CONTRACT.tokenManagerAddr;
        let scFunc = 'getAncestorInfo';

        return new TimeoutPromise((resolve, reject) => {
            let func = self.getSolInterfaceV2(contractAbi, contractAddr, scFunc);
            func(pairId).call((err, result) => {
                if (err) {
                    return reject(err);
                } else {
                    if (result && Object.keys(result).length) {
                        let length = Object.keys(result).length / 2;
                        for (let i = 0; i < length; i++) {
                            delete result[i.toString()];
                        }
                    }
                    return resolve(result);
                }
            });
        }, global.moduleConfig.promiseTimeout, "ChainType: " + self.chainType + ' getTokenPairAncestorInfo timeout');
    }
    getTokenCrossType(pairId) {
        let self = this;
        let contractAbi = global.moduleConfig.CONTRACT.tokenManagerAbi;
        let contractAddr = global.moduleConfig.CONTRACT.tokenManagerAddr;
        let scFunc = 'mapTokenPairType';

        return new TimeoutPromise((resolve, reject) => {
            let func = self.getSolInterfaceV2(contractAbi, contractAddr, scFunc);
            func(pairId).call((err, result) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(parseInt(result));
                }
            });
        }, global.moduleConfig.promiseTimeout, "ChainType: " + self.chainType + ' getTokenCrossType timeout');
    }

}

module.exports = WanChain;