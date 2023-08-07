const WanChain = require('./WanChain');
const Web3Obj = require('./Web3Obj');
const WanAgent = require('../agent/WanAgent');
if(!global.moduleConfig) {
    global.moduleConfig = require('../conf/moduleConfig.js');
}
async function getScEvents(logger, chain, scAddr, topics, fromBlk, toBlk) {
    let events;
    let cntPerTime = 50;
    try {
        events = await chain.getScEventSync(scAddr, topics, fromBlk, toBlk);
    } catch (err) {
        logger.error("getScEvents", err);
        return await Promise.reject(err);
    }

    let i = 0;
    let end;
    logger.info("events length: ", chain.chainType, events.length);



    while (i < events.length) {
        if ((i + cntPerTime) > events.length) {
            end = events.length;
        } else {
            end = i + cntPerTime;
        }
        let arr = events.slice(i, end);
        let multiEvents = [...arr].map((event) => {
            return new Promise(async (resolve, reject) => {
                if(event === null) {
                    logger.debug("event is null")
                    resolve();
                }
                try {
                    if (!event.timestamp) {
                        let block = await chain.getBlockByNumberSync(event.blockNumber);
                        event.timestamp = block.timestamp;
                    }
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        try {
            await Promise.all(multiEvents);
        } catch (err) {
            logger.error("getScEvents", err);
            return await Promise.reject(err);
        }
        i += cntPerTime;
    }
    return events;
}

function getWanChain(){
    return new WanChain(global.appLogger, global.moduleConfig.chain.nodeUrl);
}
function getWeb3Obj(chainType){
    chainType = chainType.toUpperCase();
    let chainConfig = global.moduleConfig.crossInfoDict[chainType];
    return new Web3Obj(global.appLogger, chainType, chainConfig.nodeUrl);

}
async function splitEvent( events, logger) {
    let multiEvents = [...events].map((event) => {
        return new Promise(async (resolve, reject) => {
            try {
                let wanAgent = new WanAgent();

                let decodeEvent = wanAgent.contract.parseEvent(event);



                let content;
                if (decodeEvent === null || decodeEvent === undefined) {
                    resolve();
                    return;
                } else {
                    content = await wanAgent.getDecodeEventDbData(decodeEvent);
                }

                if (content !== null) {
                    await global.modelOps.syncSave(...content);
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });

    try {
        await Promise.all(multiEvents);
        logger.debug("********************************** splitEvent done **********************************", chainType);
    } catch (err) {
        logger.error("splitEvent", err);
        return await Promise.reject(err);
    }
}
async function syncChain(logger, saveDb = true, syncFrom, syncTo) {
    const chainType = "WAN";
    logger.info("********************************** syncChain **********************************", chainType);

    let blockNumber = 0;
    let curBlock = 0;
    let chain =  new WanChain(logger,global.moduleConfig.chain.nodeUrl );

    if (!syncTo) {
        try {
            curBlock = await chain.getBlockNumberSync();
            logger.info("syncChain::Current block is:", curBlock, chainType);
        } catch (err) {
            logger.error("syncChain::getBlockNumberSync from :", chainType, err);
            return;
        }
    } else {
        syncTo = parseInt(syncTo, 10);
        curBlock = syncTo;
    }

    if (!syncFrom) {
        try {
            blockNumber = await global.modelOps.getScannedBlockNumberSync();
            //if (blockNumber > chain.safe_block_num && !global.storemanRestart) {
            if (blockNumber > chain.safe_block_num) {
                blockNumber -= chain.safe_block_num;

            } else {
                // blockNumber = global.moduleConfig.startSyncBlockNum[chainType];
                blockNumber = (curBlock > chain.trace_block_num) ? curBlock - chain.trace_block_num : 0;
            }
        } catch (err) {
            logger.error("syncChain::getScannedBlockNumberSync from :", chainType, err);
            return;
        }

        let cur = Date.now();
        // only update blockNumber before 2021/10/15 00:00:00 for DOT
      /*  if(chainType==='WAN' && global.testnet && global.storemanRestart && cur < 1662566400000) {
            blockNumber = 7545020;
        }*/
    } else {
        syncFrom = parseInt(syncFrom, 10);
        blockNumber = syncFrom;
    }


    logger.info("syncChain::Current Chain %s sync will start from block: %s, saveDb: %s", chainType, blockNumber, saveDb);

    let from = blockNumber;
    let topics = [];
    let events = [];

    if (curBlock > chain.confirm_block_num) {
        let to = curBlock - chain.confirm_block_num;
        if (syncTo) {
            to = syncTo;
        }

        try {
            if (from <= to) {
                let blkIndex = from;
                let blkEnd;
                let range = to - from;
                let cntPerTime = chain.sync_interval_block_num;

                while (blkIndex < to) {
                    if ((blkIndex + cntPerTime) > to) {
                        blkEnd = to;
                    } else {
                        blkEnd = blkIndex + cntPerTime;
                    }

                    // let contracts = global.moduleConfig.crossInfoDict[chainType].CONTRACT;
                    logger.info("syncChain::blockSync chain ", chainType, "saveDb ", saveDb, "range: From", from, " to", to, " remain ", range, ", current round FromBlk:", blkIndex, ", ToBlk:", blkEnd);
                    // let scAddr = contracts.crossScAddr;
                    let scAddress= global.moduleConfig.CONTRACT.crossScAddr;

                    let scEvents = await getScEvents(logger, chain, scAddress, topics, blkIndex, blkEnd);
                    events = events.concat(scEvents);
                    logger.info("syncChain::events chainType %s saveDb %s length %s", chainType, saveDb, events.length);
                    if (events.length > 0) {
                        await splitEvent(chainType, events, logger);
                    }

                    events = [];
                    if (saveDb) {
                        await global.modelOps.syncSaveScannedBlockNumber(chainType, blkEnd);
                        logger.info("********************************** syncChain::saveState **********************************", chainType, blkEnd);
                    } else {
                        logger.info("********************************** syncChain::chain %s saveDb %s done! **********************************", chainType, saveDb, blkEnd);
                    }

                    blkIndex += cntPerTime;
                    range -= cntPerTime;
                }
            }
        } catch (err) {
            logger.error("syncChain from :", chainType, err);
            return;
        }
    }
}

module.exports = {
    syncChain,getWanChain,getWeb3Obj
}