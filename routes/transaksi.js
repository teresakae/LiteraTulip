const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksi');

router.post('/transaksi/submit', transaksiController.submitTransaksi);
router.get('/transaksi', transaksiController.getAllTransaksi);
router.get('/transaksi/user', transaksiController.getUserTransaksi); 
router.put('/transaksi/:id', transaksiController.updateTransaksi);
router.delete('/transaksi/:id', transaksiController.deleteTransaksi);
router.get('/transaksi/:id', transaksiController.getTransaksiById);
router.put('/transaksi/:id/update-payment', transaksiController.updateTransactionPayment);
router.put('/transaksi/:id/update-status', transaksiController.updateTransactionStatus);

module.exports = router;