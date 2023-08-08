
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
    wanEvents:[
        "SmgMintLogger", "SmgReleaseLogger"
    ],
    inputType:{
            "userLock":1,"userBurn":2
    },
    CONTRACT: {
        crossControlScAddr: '0x8c70c8dFEb272C725b52f4374e3931589cAAB01E',
        crossControlScAbi: require('../abi/abi.CrossControlDelegate.json'),
        crossScAddr: '0x62dE27e16f6f31d9Aa5B02F4599Fc6E21B339e79',
        crossScAbi: require('../abi/abi.CrossDelegate.json'),
        oracleAddr: '0x27933A9b0A5c21B838843d7601B6e0b488122AE9',
        oracleAbi: require('../abi/abi.OracleDelegate.json'),
        quotaAddr: '0x7585c2ae6a3F3B2998103cB7040F811B550C9930',
        quotaAbi: require('../abi/abi.QuotaDelegate.json'),
        tokenManagerAddr: '0x017aB6485fF91C1A0a16B90E71f92B935B7213d3',
        tokenManagerAbi: require('../abi/abi.TokenManagerDelegate.json'),
        multicallScAddr: '0x14095a721Dddb892D6350a777c75396D634A7d97',
        configurationScAddr: '0x7F06174214F037588126962cfDA6fD7FF4455B07',
        configurationScAbi: require('../abi/abi.CrossConfig.json')
    },
    crossLendScAddr:{
        "CrossLendMint": "0x8ca16D5B3ba53F583230B24aAdf036eb7BfdAD4F",
        "CrossLendRepay": "0xeAAb6e905fF72B72652dA139af710ABd3118c361",
        "Type0TxParser": "0x22bb4E92D51d2dC9388245B1D1EA7b42A84F8279",
        "Type1TxParser": "0x6A2bC205E07456a95cCFFD7D01c7681cf10D8118",
        "Type2TxParser": "0x26FA14e78C82ecA49531c2C6A7fB42426C308cc5"
    },
    crossInfoDict:{
        ETH: {
                "nodeUrl": "https://nodes-testnet.wandevs.org/eth",
                "chainID": "2147483708",
                "transChainID": "5"
            },

    }
}

module.exports = config;