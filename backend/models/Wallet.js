const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  source: { type: String, enum: ['referral', 'refund', 'cashback', 'payout', 'purchase', 'reward'], required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  date: { type: Date, default: Date.now }
}, { _id: true });

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  balance: { type: Number, default: 0, min: 0 },
  totalEarned: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  transactions: [transactionSchema]
}, { timestamps: true });

// Add credit
walletSchema.methods.addCredit = function(amount, description, source, orderId = null) {
  this.balance += amount;
  this.totalEarned += amount;
  this.transactions.push({ type: 'credit', amount, description, source, orderId, date: new Date() });
  return this.save();
};

// Debit
walletSchema.methods.addDebit = function(amount, description, source, orderId = null) {
  if (this.balance < amount) throw new Error('Insufficient wallet balance');
  this.balance -= amount;
  this.totalSpent += amount;
  this.transactions.push({ type: 'debit', amount, description, source, orderId, date: new Date() });
  return this.save();
};

module.exports = mongoose.model('Wallet', walletSchema);
