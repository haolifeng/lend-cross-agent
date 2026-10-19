const { CrossCheckObj } = require("./scObj");

const moduleConfig = global.moduleConfig || require('../config/moduleConfig');

let crossCheckObj = new CrossCheckObj(
    moduleConfig.crossLendScAddr.CrossCheck,
    moduleConfig.chain.nodeUrl,
    moduleConfig.crossLendScAddr.CrossCheckABI);

/**
 * Replay guard, fail closed. Any error propagates to the caller; the caller
 * MUST stop processing this record instead of treating the failure as
 * "not finished yet".
 */
async function checkUniqeID(uniquID){
    return await crossCheckObj.checkUniqeID(uniquID);
}

module.exports = {
    checkUniqeID,
}
