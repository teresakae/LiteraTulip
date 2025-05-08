const mongoose = require('mongoose');
const transaksiSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tanggalTransaksi: { type: Date, default: Date.now },
    items: [{
        produk: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true },
    }],
    totalTransaksi: { type: Number, required: true, default: 0 },
    totalDiscountTransaksi: { type: Number, default: 0 },
    paymentOption: { type: String }, // New field for payment option
    orderStatus: { type: String, default: 'Pending Payment' }, // New field for order status
});
module.exports = mongoose.model('Transactions', transaksiSchema);