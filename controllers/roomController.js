const Room = require("../models/roomsModel");

let leaveRoomCode = "";

// Create a new room
const createRoom = async (socket, roomId) => {
  try {
    const response = await Room.create({
      roomCode: roomId,
      userId: [],
    });
    console.log(`Room created: ${response}`);
    socket.emit("RoomCreationSuccess", { success: true, message: "Room created successfully." })
  } catch (error) {
    console.log(`Room creation failed: ${error.message}`);
    socket.emit("RoomCreationSuccess", { success: false, message: "Room creation failed." })
  }
};

// Check if room exists
const checkRoomIdExists = async (roomId) => {
  try {
    const exists = await Room.exists({ roomCode: roomId });
    return !!exists;
  } catch (error) {
    console.log(`ERROR AT (checkRoomIdExists): ${error.message}`);
    return null;
  }
};

// Join an existing room
const joinRoom = async (io, socket, name, roomId) => {
  leaveRoomCode = roomId;

  const roomExists = await checkRoomIdExists(roomId);
  if (!roomExists) {
    socket.emit("errorMessage", "Room not found.");
    console.log("from joinroom : roome_not_exist")
    return;
  }

  socket.join(roomId);
  console.log(`User ${socket.id} has joined room: ${roomId}`);

  try {
    await Room.updateOne(
      { roomCode: roomId },
      { $addToSet: { userId: socket.id } } // Ensures unique socket IDs
    );

    socket.emit("userJoinSuccess", "You joined the Room")

    // Fetch updated user count
    const room = await Room.findOne({ roomCode: roomId });
    const userCount = room.userId.length;

    io.to(roomId).emit("countTotalUser", userCount);
    console.log(userCount)

    // Notify others
    socket.to(roomId).emit("userJoined", `${name} joined the Room.`);
  } catch (error) {
    console.log(`Error joining room: ${error.message}`);
    socket.emit("errorMessage", "Error joining room.");
  }
};

// User leaves the room
const leaveRoom = async (io, socket, name, roomId) => {
  try {
    socket.leave(roomId);
    await Room.updateOne(
      { roomCode: roomId },
      { $pull: { userId: socket.id } }
    );

    // Fetch updated user count
    const room = await Room.findOne({ roomCode: roomId });
    const userCount = room ? room.userId.length : 0;

    io.to(roomId).emit("countTotalUser", userCount);
    socket.emit("userLeavedRoom", { success: true })

    if (userCount === 0) {
      await Room.deleteOne({ roomCode: roomId }); // Delete empty room
      console.log("Room Deleted", roomId);
      socket.emit("successMessage", "The room was deleted!");
    } else {
      socket.to(roomId).emit("successMessage", `${name} left the room`);
    }
  } catch (error) {
    console.log(`Error leaving room: ${error.message}`);
  }
};

// Handle user disconnect
const handleUserDisconnect = async (io, socket) => {
  try {
    // Find the room the user was in
    const room = await Room.findOne({ userId: socket.id });
    if (!room) return;

    console.log(`User ${socket.id} disconnected from Room: ${room.roomCode}`);

    await leaveRoom(io, socket, "Unknown User", room.roomCode);
  } catch (error) {
    console.log(`Error handling disconnect: ${error.message}`);
  }
};

module.exports = {
  createRoom,
  checkRoomIdExists,
  joinRoom,
  leaveRoom,
  handleUserDisconnect,
};
