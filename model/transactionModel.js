const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    merchantId: String,
    merchantTransactionId: String,
    transactionId: String,
    amount: Number,
    state: String,
    responseCode: String,
    paymentInstrument: Object,
    userId: String,
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
