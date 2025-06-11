const express = require("express");
const router = express.Router();
const midtransClient = require("midtrans-client");

// Setup Snap API
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

router.post("/create-transaction", async (req, res) => {
  const { orderId, grossAmount, customerName, email } = req.body;

  try {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customerName,
        email: email,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans error:", error);
    res.status(500).json({ message: "Gagal membuat transaksi Midtrans." });
  }
});

module.exports = router;
