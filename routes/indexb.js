    const express = require("express");
    const authRoutes = require("./authRoutes");
    const doctorRoutes = require("./doctorRoutes");
    const prescriptionRoutes = require("./prescriptionRoutes");
    const medicineRoutes = require("./medicineRoutes");
    const statsRoutes = require("./statsRoutes");

    const router = express.Router();
    router.use("/auth", authRoutes);
    router.use("/doctors", doctorRoutes);
    router.use("/prescriptions", prescriptionRoutes);
    router.use("/medicines", medicineRoutes);
    router.use("/stats", statsRoutes);

    router.get("/", (req, res) => res.send("Welcome to Hospital Management API"));
    module.exports = router;