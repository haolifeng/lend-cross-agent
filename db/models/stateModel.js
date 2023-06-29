const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const stateSchema = new Schema({

  scannedBlockNumber: {
    type: Number,
    required: true,
    default: '0'
  }
}, {
  collection: 'state',
  id: false
});

module.exports = stateSchema;