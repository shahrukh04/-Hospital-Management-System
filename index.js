const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const socketSetup = require("./socket");
const routes = require("./routes/indexb");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ 
    origin: ["https://hospital-frontend.vercel.app"], // Add your Vercel frontend URL here
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // If using cookies or authentication
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

        // Routes
        app.use("/api", routes);
        
        // Socket setup
        socketSetup(server);
        
        // 404 handler
        app.use((req, res) => res.status(404).json({ message: "Route not found" }));
        
        // Start server
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();