
let config = {
    wallet:{
        words: "deer funny trip dress siren crane build stomach thunder setup yellow audit",
    },
    logServerUrl: '127.0.0.1',
    logServerPort: global.dev ? 1516 : 1514,
    dbUrl : `mongodb://127.0.0.1:27017` + '/lendcross',

    promiseTimeout: 300 * 1000,
    INTERVAL_TIME: 10 * 1000,
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
        crossScAddr: '0x62dE27e16f6f31d9Aa5B02F4599Fc6E21B339e79',
        crossScAbi: require('../abi/abi.CrossDelegate.json'),
        tokenManagerAddr: '0x017aB6485fF91C1A0a16B90E71f92B935B7213d3',
        tokenManagerAbi: require('../abi/abi.TokenManagerDelegate.json'),
    },
    crossLendScAddr:{
        CrossCheckABI:require('../abi/CrossCheck_abi.json'),
        Type0TxParserAbi: require('../abi/Type0TxParser_abi.json'),
        Type1TxParserAbi:require('../abi/Type1TxParser_abi.json'),
        Type2TxParserAbi:require('../abi/Type2TxParser_abi.json'),

        "CrossCheck": "0x82640eCC1E638b9C3Cab7D663E34e05C308c1697",
        "CrossLendMint": "0xD24f200C4C847C5afd05244D210837b4e74dC146",
        "CrossLendRepay": "0x9F04c7e80297fCa5a3D77D28Ecaa561d4825b3c5",
        "Type0TxParser": "0x9065BA060aC1A94795155b76d1C724FAD457EeC5",
        "Type1TxParser": "0x287851866f99C9A4f4a8B8d0385a1Ec924172298",
        "Type2TxParser": "0xB3FCC2e4d5d853936b109AcDB56C7a1C46d0FA9A"

    },
    crossInfoDict:{
        ETH: {
                "nodeUrl": "https://nodes-testnet.wandevs.org/eth",
                "chainID": "2147483708",
                "transChainID": "5"
            },
        AVAX:{
            "nodeUrl": "https://api.avax-test.network/ext/bc/C/rpc",
            "chainID": "2147492648",
            "transChainID": "43113"
        },
        MOONBEAM:{
            "nodeUrl": "https://moonbeam-alpha.api.onfinality.io/public",
            "chainID": "1073741825",
            "transChainID": "1287"
        }

    }
}

module.exports = config;