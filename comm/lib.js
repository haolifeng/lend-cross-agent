const BigNumber = require('bignumber.js');

const {
    getWanChain
} = require('../chain/index');
function hexTrip0x(hexs) {
    if (0 == hexs.indexOf('0x')) {
        return hexs.slice(2);
    }
    return hexs;
}

function hexAdd0x(hexs) {
    if (0 != hexs.indexOf('0x')) {
        return '0x' + hexs;
    }
    return hexs;
}

function toBigNumber (n) {
    n = n || 0;

    if (typeof n === 'string' && (n.indexOf('0x') === 0 || n.indexOf('-0x') === 0)) {
        return new BigNumber(n.replace('0x', ''), 16);
    }

    return new BigNumber(n.toString(10), 10);
}
function sleep(time) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, time);
    })
}

function getGlobalWanChain(){
     global.WanChain = getWanChain();
     return global.WanChain;
}

module.exports = {
    sleep,
    hexAdd0x,
    hexTrip0x,
    toBigNumber,
    getGlobalWanChain,
}