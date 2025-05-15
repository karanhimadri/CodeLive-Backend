require("dotenv").config();
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL);

/**
 * Create a new room in Redis with an empty users list.
 * @param {string} roomId
 */
const createRoom = async (roomId) => {
  const key = `room:${roomId}`;
  const room = {
    roomId,
    users: [],
  };
  await redis.set(key, JSON.stringify(room));
};

/**
 * Check if a room exists in Redis.
 * @param {string} roomId
 * @returns {Promise<boolean>}
 */
const checkRoomExists = async (roomId) => {
  const key = `room:${roomId}`;
  const exists = await redis.exists(key);
  return exists === 1;
};

/**
 * Add a user to the room users list (if not already present).
 * @param {string} roomId
 * @param {string} userId
 */
const addUserToRoom = async (roomId, userId) => {
  const key = `room:${roomId}`;
  const roomStr = await redis.get(key);
  if (!roomStr) return false;

  const room = JSON.parse(roomStr);
  if (!room.users.includes(userId)) {
    room.users.push(userId);
    await redis.set(key, JSON.stringify(room));
  }
  return true;
};

/**
 * Remove a user from the room users list.
 * @param {string} roomId
 * @param {string} userId
 */
const removeUserFromRoom = async (roomId, userId) => {
  const key = `room:${roomId}`;
  const roomStr = await redis.get(key);
  if (!roomStr) return false;

  const room = JSON.parse(roomStr);
  room.users = room.users.filter((id) => id !== userId);
  await redis.set(key, JSON.stringify(room));
  return true;
};

/**
 * Get current users count in the room.
 * @param {string} roomId
 * @returns {Promise<number>}
 */
const getUserCountInRoom = async (roomId) => {
  const key = `room:${roomId}`;
  const roomStr = await redis.get(key);
  if (!roomStr) return 0;

  const room = JSON.parse(roomStr);
  return room.users.length;
};

/**
 * Delete a room from Redis.
 * @param {string} roomId
 */
const deleteRoom = async (roomId) => {
  const key = `room:${roomId}`;
  await redis.del(key);
};

module.exports = {
  createRoom,
  checkRoomExists,
  addUserToRoom,
  removeUserFromRoom,
  getUserCountInRoom,
  deleteRoom,
};
