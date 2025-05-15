require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const ConnectDB = require("./config/database");
const { createRoom, joinRoom, leaveRoom, handleUserDisconnect } = require("./controllers/roomController");
const { updatePythonCode, handleMsgFromClient } = require("./controllers/codeMsgController");
const { pythonCodeExecution } = require("./controllers/codeExecutionController");

const PORT = 8080;
const app = express();
const server = http.createServer(app);
ConnectDB();

app.use(express.json());

// Enable CORS for all origins
app.use(cors({ origin: "*", methods: ["GET", "POST"], credentials: true }));

// Just for checking purpose
app.get("/", (req, res) => {
  res.send("Server is running at port 8080");
});

// Initialize socket.io
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

// Handle user connections
io.on("connection", (socket) => {
  console.log(`A user connected & ID is :${socket.id}`);

  // Client connection validation
  socket.on("messageFromClient", () => {
    socket.emit("validateConnection", "Server is connected.");
  });

  // Create a new room
  socket.on("createRoom", (roomCode) => {
    createRoom(socket, roomCode);
  });

  // Join an existing room
  socket.on("joinRoom", ({ name, roomCode }) => {
    joinRoom(io, socket, name, roomCode);
  });

  // Update code in the room
  socket.on("updateCode", ({ roomCode, code }) => {
    updatePythonCode(socket, { roomCode, code });
  });

  // Handle client messages and broadcast to the room
  socket.on("msgFromClient", ({ roomCode, name, msg }) => {
    handleMsgFromClient(socket, { roomCode, name, msg });
  });

  // User leaves the room
  socket.on("leaveRoom", ({ name, roomCode }) => {
    leaveRoom(io, socket, name, roomCode);
  });

  // RUNNING PYTHON PROGRAMS
  socket.on("execute-code", (code) => {
    pythonCodeExecution(socket, code);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    handleUserDisconnect(io, socket);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
