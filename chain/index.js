const WanChain = require('./WanChain');
if(!global.moduleConfig) {
    global.moduleConfig = require('../conf/moduleConfig.js');
}
async  function getScEvents(logger,chain, scAddr, topics, fromBlk, toBlk) {
    let events;
    let cntPerTime = 50;

    try{
        events = await chain.getScEventSync(scAddr, topics, fromBlk, toBlk);
    }catch (err) {
        logger.error("getScEvents", err);
        return await Promise.reject(err);
    }

    let i = 0;
    let end;
    logger.info("events length: ", chain.chainType, events.length);



}

function getChain(logger, nodeUrl){
    return new WanChain(logger, nodeUrl);
}

async function syncChain(chainType, logger, saveDb = true, syncFrom, syncTo) {
    logger.info("********************************** syncChain **********************************", chainType);

    let blockNumber = 0;
    let curBlock = 0;
    let chain =  getChain(logger,global.moduleConfig.chain.nodeUrl );

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
                if (['XRP', 'DOT'].includes(chainType) && blockNumber < curBlock - chain.trace_block_num) {
                    // if (blockNumber < curBlock - chain.trace_block_num) {
                    blockNumber = (curBlock > chain.trace_block_num) ? curBlock - chain.trace_block_num : 0;
                }
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
        if(chainType==='DOT' && global.storemanRestart && cur < 1634227200000) {
            // blockNumber = 5805050 ; //TODO: delete this line  5805910
            // blockNumber = 5865663 ; //TODO: delete this line
            blockNumber = 7229600;
        }

        if(chainType==='ARB' && global.testnet && global.storemanRestart && cur < 1662566400000) {
            blockNumber = 251480;
        }

        if(chainType==='ETH' && global.testnet && global.storemanRestart && cur < 1662566400000) {
            blockNumber = 7545020;
        }

        if(chainType==='OPT' && global.testnet && global.storemanRestart && cur < 1663065846000) {
            blockNumber = 31950;
        }
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
                    logger.info("syncChain::blockSync chain ", chainType, "saveDb ", saveDb, "range: From", from, " to", to, " remain ", range, ", current round FromBlk:", blkIndex, ", ToBlk:", blkEnd, " while global.configMutex is", global.configMutex);
                    // let scAddr = contracts.crossScAddr;
                    let scAddr= [].concat(global.tokenList[chainType].crossScAddr);

                    while (global.configMutex && saveDb) {
                        await sleep(1000);
                    }

                    if(chain.matchAllScAddressPerScan) {
                        events = await getScEvents(logger, chain, scAddr, topics, blkIndex, blkEnd);
                    }
                    else {
                        for (let scAddress of scAddr) {
                            let scEvents = await getScEvents(logger, chain, scAddress, topics, blkIndex, blkEnd);
                            events = events.concat(scEvents);
                        }
                    }

                    logger.info("syncChain::events chainType %s saveDb %s length %s", chainType, saveDb, events.length);
                    if (events.length > 0) {
                        await splitEvent(chainType, events, logger);
                    }
                    if(chainType === "ADA") {
                        let adaAgent = new global.agentDict[chainType]();
                        adaAgent.tryMerageUtxo();
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
    syncChain
}