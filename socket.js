const { Server } = require("socket.io");

const users = {}; // Store active users by userId
const socketToUserMap = {}; // Maps socket.id to userId

module.exports = (server) => {
    const io = new Server(server, { cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] } });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("join_chat", ({ userId, username }) => {
            if (userId && username) {
                users[userId] = username; // Ensure user is stored
                socketToUserMap[socket.id] = userId; // Track socket connection
            }

            // Emit the full updated user list
            io.emit("user_list", Object.values(users)); 
            console.log("Updated active users:", users);
        });

        socket.on("send_message", (data) => {
            const senderId = socketToUserMap[socket.id]; 
            const senderName = users[senderId]; // Get the sender's name
        
            if (senderName) {
                const messageData = { sender: senderName, text: data.text };
                io.emit("receive_message", messageData); // Emit message to all clients
                console.log("Message sent:", messageData);
            }
        });

        socket.on("logout", () => {
            const userId = socketToUserMap[socket.id];

            if (userId) {
                delete users[userId]; // Remove from active users
                delete socketToUserMap[socket.id]; // Remove socket mapping
                io.emit("user_list", Object.values(users)); 
                console.log(`User logged out: ${userId}`);
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
            delete socketToUserMap[socket.id]; 
        });
    });
};
