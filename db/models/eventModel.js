const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const eventSchema = new Schema({
    uniqueID: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    smgID:{
        type:String
    },
    tokenPairID: {
        type: Number,
    },
    value: {
        type: String,
    },
    tokenAccount:{
        type:String,
    },
    userAccount:{
        type:String
    }

}, {
    collection: 'event'
})

module.exports = eventSchema;