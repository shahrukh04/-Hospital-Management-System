const express = require("express");

const router = express.Router();

// Monthly stats
router.get("/monthly", (req, res) => {
    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{ label: "Prescriptions", data: [30, 45, 60, 70, 65, 85], borderColor: "#4F46E5", tension: 0.4 }]
    };
    res.json(data);
});

// Distribution stats
router.get("/distribution", (req, res) => {
    const data = {
        labels: ["General", "Cardiology", "Pediatrics", "Orthopedics"],
        datasets: [{ data: [35, 25, 20, 20], backgroundColor: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"], borderWidth: 0 }]
    };
    res.json(data);
});

module.exports = router;
