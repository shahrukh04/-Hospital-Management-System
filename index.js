import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import connectDB from "./config/db.js";
import socketSetup from "./socket.js";
import routes from "./routes/indexb.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Updated CORS configuration to support both local and production
app.use(cors({
    origin: ["http://localhost:5173", "https://hospital-frontend-tan.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
    try {
        // Connect to MongoDB using Mongoose (for auth)
        await connectDB();

        // Connect to MongoDB using native driver (for collections)
        const client = await MongoClient.connect(mongoURI);
        const db = client.db("medicine");
        console.log("Connected to MongoDB with native driver");

        // Store collections in app.locals
        app.locals.medicineCollection = db.collection('medicines');
        app.locals.doctorCollection = db.collection('doctors');
        app.locals.prescriptionCollection = db.collection('prescriptions');
        app.locals.patientCollection = db.collection('patients');
        app.locals.appointmentCollection = db.collection('appointments');
        app.locals.billingCollection = db.collection('billings');
        app.locals.staffCollection = db.collection('staff');
        app.locals.labCollection = db.collection('labs');
        app.locals.emergencyCollection = db.collection('emergencies');

        // Routes
        app.use("/api", routes);

        // Socket setup
        socketSetup(server);

        // 404 handler
        app.use((req, res) => res.status(404).json({ message: "Route not found" }));

        // Start server
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Server accepting connections from:`);
            console.log(`- http://localhost:5173 (Local Frontend)`);
            console.log(`- https://hospital-frontend-tan.vercel.app (Production Frontend)`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
