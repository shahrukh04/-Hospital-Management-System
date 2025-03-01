import mongoose from "mongoose";

const distributionStatsSchema = new mongoose.Schema({
    category: String,
    value: Number,
    createdAt: { type: Date, default: Date.now }
});

const DistributionStats = mongoose.model("DistributionStats", distributionStatsSchema);

export default DistributionStats;
