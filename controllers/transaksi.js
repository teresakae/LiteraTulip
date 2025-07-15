const Transaksi = require("../models/transaksi");
const Product = require("../models/produk");

const submitTransaksi = async (req, res) => {
  try {
    const cartItems = req.body.cartItems;
    const userId = req.user ? req.user._id : null;

    if (!cartItems || cartItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Tidak ada item dalam keranjang." });
    }

    const transactionItems = [];
    let totalTransaksi = 0;
    let totalDiscountTransaksi = 0;
    const discountPercentage = 0.1;
    const maxDiscount = 50000;

    for (const item of cartItems) {
      const product = await Product.findById(item.produk);
      if (!product) {
        return res.status(404).json({
          message: `Produk dengan ID ${item.produk} tidak ditemukan.`,
        });
      }

      if (parseInt(product.stok) < item.quantity) {
        return res.status(400).json({
          message: `Stok untuk produk ${product.nama} tidak mencukupi.`,
        });
      }

      const originalTotal = product.harga * item.quantity;
      let discount = 0;
      let totalAfterDiscount = originalTotal;

      if (userId) {
        discount = originalTotal * discountPercentage;
        if (discount > maxDiscount) {
          discount = maxDiscount;
        }
        totalAfterDiscount = originalTotal - discount;
      }

      transactionItems.push({
        produk: item.produk,
        price: product.harga,
        quantity: item.quantity,
        discount: discount,
        total: totalAfterDiscount,
      });

      totalTransaksi += totalAfterDiscount;
      totalDiscountTransaksi += discount;

      product.stok = product.stok - item.quantity;
      product.jumlahTerjual += item.quantity;
      await product.save();
    }

    if (transactionItems.length > 0) {
      const transaksi = new Transaksi({
        user: userId,
        items: transactionItems,
        totalTransaksi: totalTransaksi,
        totalDiscountTransaksi: totalDiscountTransaksi,
      });

      const savedTransaksi = await transaksi.save();
      res.status(201).json({
        message: "Transaksi berhasil diproses.",
        transactionId: savedTransaksi._id,
      });
    } else {
      res.status(200).json({ message: "Tidak ada transaksi yang diproses." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getAllTransaksi = async (req, res) => {
  try {
    const transaksi = await Transaksi.find({})
      .populate("user", "username")
      .populate("items.produk", "nama")
      .sort({ tanggalTransaksi: -1 });
    res.status(200).json(transaksi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTransaksi = async (req, res) => {
  try {
    const transaksiId = req.params.id;
    const { items: updatedItems } = req.body;

    const transaksi = await Transaksi.findById(transaksiId);
    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    if (!updatedItems || !Array.isArray(updatedItems)) {
      return res
        .status(400)
        .json({ message: "Data item transaksi yang valid diperlukan." });
    }

    let newTotalTransaksi = 0;
    let newTotalDiscountTransaksi = 0;
    const discountPercentage = 0.1;
    const maxDiscount = 50000;

    const processedItems = [];
    for (const item of updatedItems) {
      const product = await Product.findById(item.produk);
      if (!product) {
        return res.status(404).json({
          message: `Produk dengan ID ${item.produk} tidak ditemukan.`,
        });
      }

      if (parseInt(product.stok) < item.quantity) {
        return res.status(400).json({
          message: `Stok untuk produk ${product.nama} tidak mencukupi.`,
        });
      }

      const originalTotal = product.harga * item.quantity;
      let discount = originalTotal * discountPercentage;
      if (discount > maxDiscount) {
        discount = maxDiscount;
      }
      const totalAfterDiscount = originalTotal - discount;

      processedItems.push({
        produk: item.produk,
        price: product.harga,
        quantity: item.quantity,
        discount: discount,
        total: totalAfterDiscount,
      });

      newTotalTransaksi += totalAfterDiscount;
      newTotalDiscountTransaksi += discount;

      const oldItem = transaksi.items.find(
        (old) => old.produk.toString() === item.produk
      );
      const stockChange = (oldItem ? oldItem.quantity : 0) - item.quantity;
      product.stok = parseInt(product.stok) + stockChange;
      await product.save();
    }

    transaksi.items = processedItems;
    transaksi.totalTransaksi = newTotalTransaksi;
    transaksi.totalDiscountTransaksi = newTotalDiscountTransaksi;
    await transaksi.save();

    res.status(200).json(transaksi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTransaksi = async (req, res) => {
  try {
    const transaksiId = req.params.id;
    const transaksi = await Transaksi.findById(transaksiId);

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    for (const item of transaksi.items) {
      const product = await Product.findById(item.produk);
      if (product) {
        product.stok = parseInt(product.stok) + item.quantity;
        await product.save();
      }
    }

    await transaksi.deleteOne();
    res.status(200).json({ message: "Transaksi berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTransaksiById = async (req, res) => {
  try {
    const transaksiId = req.params.id;
    const transaksi = await Transaksi.findById(transaksiId)
      .populate("user", "username")
      .populate("items.produk", "nama");
    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }
    res.status(200).json(transaksi);
  } catch (err) {
    console.error("SERVER ERROR in getTransaksiById:", err);
    res.status(500).json({ message: "Server error while fetching transaction details.", error: err.message });
  }
};

const updateTransactionPayment = async (req, res) => {
  try {
    const transaksiId = req.params.id;
    const { paymentOption } = req.body;

    const transaksi = await Transaksi.findByIdAndUpdate(
      transaksiId,
      { paymentOption },
      { new: true }
    )
      .populate("user")
      .populate("items.produk");

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    res.status(200).json({
      message: "Payment option updated successfully.",
      transaction: transaksi,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const transaksiId = req.params.id;
    const { orderStatus: newStatus } = req.body;

    if (!newStatus) {
      return res.status(400).json({ message: "No new status provided." });
    }

    const transaction = await Transaksi.findById(transaksiId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    const currentStatus = transaction.orderStatus;
    const allowedTransitions = {
      'Pending Payment': ['Paid'],
      'Paid': ['Paid', 'Being Processed', 'In Delivery', 'Delivered'],
      'Being Processed': ['Being Processed', 'In Delivery', 'Delivered'],
      'In Delivery': ['In Delivery', 'Delivered'],
      'Delivered': ['Delivered']
    };
    
    if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({ message: `Cannot change status from '${currentStatus}' to '${newStatus}'.` });
    }

    transaction.orderStatus = newStatus;
    await transaction.save();

    res.status(200).json({
      message: "Transaction status updated successfully.",
      transaction: transaction,
    });
  } catch (err) {
    console.error("Error in updateTransactionStatus:", err);
    res.status(500).json({ error: err.message });
  }
};

const getUserTransaksi = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(400).json({ message: "User is not logged in." });
    }
    const transaksi = await Transaksi.find({ user: userId })
      .populate("user", "username")
      .populate("items.produk", "nama")
      .sort({ tanggalTransaksi: -1 });
      
    res.status(200).json(transaksi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  submitTransaksi,
  getAllTransaksi,
  updateTransaksi,
  deleteTransaksi,
  getTransaksiById,
  getUserTransaksi,
  updateTransactionPayment,
  updateTransactionStatus,
};