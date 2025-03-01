import mongoose from "mongoose";

const performanceMetricsSchema = new mongoose.Schema({
    metricName: String,
    value: Number,
    createdAt: { type: Date, default: Date.now }
});

const PerformanceMetrics = mongoose.model("PerformanceMetrics", performanceMetricsSchema);

export default PerformanceMetrics;
