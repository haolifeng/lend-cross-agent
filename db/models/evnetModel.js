const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const eventSchema = new Schema({
    hashX: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
}, {
    collection: 'event'
})

module.exports = eventSchema;