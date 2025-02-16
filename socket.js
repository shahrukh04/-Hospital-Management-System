// backend/socket.js
const { Server } = require("socket.io");

const users = {}; // Stores userId and username
const socketToUserMap = {}; // Maps socket.id to userId

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["https://hospital-frontend-tan.vercel.app", "http://localhost:5173"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Handle user joining the chat
        socket.on("join_chat", ({ userId, username }) => {
            if (userId && username) {
                users[userId] = { username, isOnline: true }; // Add user with online status
                socketToUserMap[socket.id] = userId; // Map socket.id to userId
            }

            // Emit updated user list to all clients
            io.emit("user_list", Object.entries(users).map(([id, user]) => ({
                userId: id,
                username: user.username,
                isOnline: user.isOnline
            })));
            console.log("Updated active users:", users);
        });

        // Handle sending messages
        socket.on("send_message", (data) => {
            const userId = socketToUserMap[socket.id];
            const senderName = users[userId]?.username;

            if (senderName) {
                const messageData = { sender: senderName, text: data.text };
                io.emit("receive_message", messageData);
                console.log("Message sent:", messageData);
            }
        });

        // Handle user logout
        socket.on("logout", () => {
            const userId = socketToUserMap[socket.id];

            if (userId) {
                users[userId].isOnline = false; // Mark user as offline
                delete socketToUserMap[socket.id]; // Remove socket mapping
                io.emit("user_list", Object.entries(users).map(([id, user]) => ({
                    userId: id,
                    username: user.username,
                    isOnline: user.isOnline
                })));
                console.log(`User logged out: ${userId}`);
            }
        });

        // Handle user disconnection
        socket.on("disconnect", () => {
            const userId = socketToUserMap[socket.id];

            if (userId) {
                users[userId].isOnline = false; // Mark user as offline
                delete socketToUserMap[socket.id]; // Remove socket mapping
                io.emit("user_list", Object.entries(users).map(([id, user]) => ({
                    userId: id,
                    username: user.username,
                    isOnline: user.isOnline
                })));
                console.log(`User disconnected: ${userId}`);
            }
        });
    });
};