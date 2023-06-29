
let config = {
    logServerUrl: '127.0.0.1',
    logServerPort: global.dev ? 1516 : 1514,
    dbUrl : `mongodb://127.0.0.1:27017` + '/lendcross',

    promiseTimeout: 300 * 1000,
    chain:{
        nodeUrl:'https://nodes-testnet.wandevs.org/wan',
        chainID: "2153201998",
        transChainID: "999",

        SAFE_BLOCK_NUM: 100,
        CONFIRM_BLOCK_NUM: 12,
        TRACE_BLOCK_NUM: 100000,
        SYNC_INTERVAL_BLOCK_NUM: 2000,
        SYNC_INTERVAL_TIME: 5 * 1000,
    },
    scAddrs:[]
}

module.exports = config;