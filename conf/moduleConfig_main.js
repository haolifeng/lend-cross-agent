let config = {
    logServerUrl: '127.0.0.1',
    logServerPort: global.dev ? 1516 : 1514,
    dbUrl : `mongodb://127.0.0.1:27017` + '/lendcross',
    promiseTimeout: 300 * 1000,
    chain:{
        nodeUrl:'https://nodes.wandevs.org/wan',
        chainID: "2153201998",
        transChainID: "888",
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
        crossControlScAddr: '0x7E363061d923E23a0361bB4D5542D65E21E53f48',
        crossControlScAbi: require('../abi/abi.CrossControlDelegate.json'),
        crossScAddr: '0xe85b0D89CbC670733D6a40A9450D8788bE13da47',
        crossScAbi: require('../abi/abi.CrossDelegate.json'),
        oracleAddr: '0xa2b6CFAE041371A30bED5f2092393f03D6dCDEEc',
        oracleAbi: require('../abi/abi.OracleDelegate.json'),
        quotaAddr: '0xD076B7fe116da6CcBDA8494771AFeADA7E56e4EE',
        quotaAbi: require('../abi/abi.QuotaDelegate.json'),
        tokenManagerAddr: '0x9Fdf94Dff979dbECc2C1a16904bDFb41D305053A',
        tokenManagerAbi: require('../abi/abi.TokenManagerDelegate.json'),
        multicallScAddr: '0xBa5934Ab3056fcA1Fa458D30FBB3810c3eb5145f',
        configurationScAddr: '0x47bE7cC7c13315Fdd1bbf3dBaB512AF23961Ba53',
        configurationScAbi: require('../abi/abi.ConfigurationDelegate.json')
    },
    crossLendScAddr:{
        "CrossCheck": "0x500378578469FBf43C5708942eF53EE3cB378B0c",
        "CrossLendMint": "0x5Ad8Cb6baA0899Fdf9179b80984cA3cAC75DC51c",
        "CrossLendRepay": "0x0C027b777a5d74E04687040c1EFe5B0e7c6A53c3",
        "Type0TxParser": "0xDD73e460b35BdE8ef2A742790C3555E3162E39fB",
        "Type1TxParser": "0x20703C269c78381a868173CEF6a18C8BAA55C026",
        "Type2TxParser": "0x1d7Dd466a9B07593430e760b58F63fd2DDAbEB9A"
    },
    crossInfoDict:{
        ETH: {
            "nodeUrl": "https://nodes.wandevs.org/eth",
            "chainID": "2147483708",
            "transChainID": "1"
        },

    }
}

module.exports = config;