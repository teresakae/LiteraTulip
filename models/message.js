    // models/message.js
    const mongoose = require('mongoose');

    const messageSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        userId: {
            type: String, // <-- UBAH KE STRING
            // required: true, // <-- HAPUS ATAU KOMENTARI INI
            // ref: 'User' // <-- HAPUS ATAU KOMENTARI INI
            // Kita akan membuat ini opsional dengan tidak menyertakan 'required: true'
            // atau Anda bisa menambahkan 'required: function() { return !this.isAI; }'
            // Untuk kesederhanaan, kita akan membuatnya opsional sepenuhnya atau memastikan selalu ada nilai.
            // Karena AI memiliki 'ai-bot-id', ini akan selalu ada nilai string.
        },
        isAI: {
            type: Boolean,
            default: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    });

    module.exports = mongoose.model('Message', messageSchema);
    