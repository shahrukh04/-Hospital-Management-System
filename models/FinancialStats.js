import mongoose from "mongoose";

const financialStatsSchema = new mongoose.Schema({
    revenue: Number,
    expenses: Number,
    createdAt: { type: Date, default: Date.now }
});

const FinancialStats = mongoose.model("FinancialStats", financialStatsSchema);

export default FinancialStats;
