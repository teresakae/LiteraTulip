// models/customer-service.js

const mongoose = require('mongoose');

const customerServiceSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'senderModel',
        required: true 
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['User', 'Admin']
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'receiverModel',
        required: false // ❗️ CHANGE THIS from true to false
    },
    receiverModel: {
        type: String,
        required: false, // ❗️ AND CHANGE THIS from true to false
        enum: ['User', 'Admin']
    },
    content: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('CustomerServiceMessage', customerServiceSchema);