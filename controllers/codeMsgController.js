const Room = require("../models/roomsModel");

const checkRoomIdExists = async (roomId) => {
  try {
    const exists = await Room.exists({ roomCode: roomId });
    return !!exists;
  } catch (error) {
    console.log(`ERROR AT (checkRoomIdExists): ${error.message}`);
    return null;
  }
};

const updatePythonCode = async (socket, { roomCode, code }) => {
  if (roomCode) {
    // Broadcast the code update to other users in the room
    socket.to(roomCode).emit("codeUpdate", code);
    console.log(`Code updated in room ${roomCode}: ${code}`);
  } else {
    console.log(`Invalid room code: ${roomCode}`);
    socket.emit("error", "Invalid room code");
  }
};

// Handle client messages and broadcast to the room
const handleMsgFromClient = async (socket, { roomCode, name, msg }) => {
  if (roomCode) {
    socket.to(roomCode).emit("msgFromServer", { name: name, message: msg });
  }
};

module.exports = {
  updatePythonCode,
  handleMsgFromClient,
};
