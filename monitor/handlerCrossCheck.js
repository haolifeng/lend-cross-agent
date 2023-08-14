const {CrossCheckObj} = require("./scObj");

let crossCheckObj = new CrossCheckObj(global.moduleConfig.crossLendScAddr.CrossCheck, global.moduleConfig.chain.nodeUrl, global.moduleConfig.crossLendScAddr.CrossCheckABI);

async function checkUniqeID(uniquID){
    console.log('in handlerCrossCheck.checkUniqeID --- uniquID ', uniquID );
    let ret = await crossCheckObj.checkUniqeID(uniquID);
    return ret;
}

module.exports = {
    checkUniqeID,
}