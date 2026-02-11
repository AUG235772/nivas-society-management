const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kisne complain ki
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true }, // Society context
  title: { type: String, required: true },
  description: { type: String, required: true },
  photo: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
