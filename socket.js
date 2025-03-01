import { Server } from "socket.io";

const users = {}; // Stores userId and username
const socketToUserMap = {}; // Maps socket.id to userId

const setupSocket = (server) => {
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
                users[userId] = { username, isOnline: true };
                socketToUserMap[socket.id] = userId;
            }

            emitUserList(io);
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
            handleUserDisconnect(socket, io);
            console.log(`User logged out: ${socketToUserMap[socket.id]}`);
        });

        // Handle user disconnection
        socket.on("disconnect", () => {
            handleUserDisconnect(socket, io);
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

// Helper function to emit user list
const emitUserList = (io) => {
    io.emit("user_list", Object.entries(users).map(([id, user]) => ({
        userId: id,
        username: user.username,
        isOnline: user.isOnline
    })));
};

// Helper function to handle user disconnect/logout
const handleUserDisconnect = (socket, io) => {
    const userId = socketToUserMap[socket.id];
    if (userId) {
        users[userId].isOnline = false;
        delete socketToUserMap[socket.id];
        emitUserList(io);
    }
};

export default setupSocket;
