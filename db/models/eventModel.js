const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/*
*                   hashX: args.uniqueID,
                    uniqueID:args.uniqueID,
                    crossLendScAddr: this.getDecodeCrossAddress(decodeEvent).toLowerCase(),
                    toHtlcAddr: this.getDecodeEventToHtlcAddr(decodeEvent),
                    tokenAddr: args.tokenAccount.toLowerCase(),
                    tokenPairID: tokenPairID,
                    crossFromChainSymobl:crossFromChainSymobl,
                    value: args.value,
                    transactionHash: decodeEvent.transactionHash,
                    blockNumber: decodeEvent.blockNumber,
                    eventName:eventName,
                    timestamp:decodeEvent.timestamp,
* */

const eventSchema = new Schema({
    hashX: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    uniqueID: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    crossLendScAddr:{  //crossLendMint sc addr or crossLendRepay sc addr
        type: String,
        lowercase: true
        },
    toHtlcAddr:{
        type: String,
        lowercase: true
    }, // crossDelegate sc addr
    tokenAddr:{
        type: String,
        lowercase: true
    },  // cross underlyingToken
    tokenPairID:{
        type: Number,
    },
    crossFromChainSymobl:{
        type: String,
    },  //cross from chain
    value: {
        type: String,
    },
    transactionHash: {
        type: String,
    },
    blockNumber: {
        type: Number
    },
    eventName:{
        type: String,
    },
    timestamp:{
        type: Number
    },
    status: {
        type: String,
        default: 'init'
        /*
            init finished
        */
    },
}, {
    collection: 'event'
})

module.exports = eventSchema;