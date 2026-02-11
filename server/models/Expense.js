const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
