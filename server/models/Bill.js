const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kiska bill hai
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true }, // Society context
  month: { type: String, required: true }, // e.g., "February 2026"
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  paidAt: { type: Date }, // Kab pay kiya
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },
  paymentMethod: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', BillSchema);
