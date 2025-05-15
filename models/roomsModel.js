const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  userId: { type: [String], default: [] },
});

const Room = mongoose.model('Room', roomSchema)

module.exports = Room