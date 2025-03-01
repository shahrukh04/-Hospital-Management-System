const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportType: { type: String },
    parameters: { type: Object },
    generatedAt: { type: Date, default: Date.now },
    fileUrl: { type: String }
});

module.exports = mongoose.model('Report', reportSchema);
