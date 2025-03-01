import mongoose from "mongoose";

const demographicsStatsSchema = new mongoose.Schema({
    ageGroup: String,
    count: Number,
    createdAt: { type: Date, default: Date.now }
});

const DemographicsStats = mongoose.model("DemographicsStats", demographicsStatsSchema);

export default DemographicsStats;
