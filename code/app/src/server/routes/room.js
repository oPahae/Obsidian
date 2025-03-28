import express from 'express'
import mongoose from 'mongoose'
import Room from '../models/Room.js'
import User from '../models/User.js'
import connect from '../lib/connect.js'

const router = express.Router()

router.post('/check', async (req, res) => {
  try {
    await connect()
    const { id } = req.body
    
    if (!id) {
      return res.status(400).json({ message: "Room ID is required" })
    }

    const room = await Room.findById(id)

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    return res.status(200).json({ message: "OK" })
  } catch (error) {
    console.error("Error checking room:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
})

router.post('/create', async (req, res) => {
  const { 
    name, img, ip, port, owner, ownerID, 
    maxMembers, type, description, 
    boysOnly, girlsOnly, plus18Only 
  } = req.body
  
  try {
    await connect()
    const newRoom = new Room({
      name,
      ip,
      port,
      owner,
      ownerID,
      maxMembers,
      type,
      description,
      boysOnly,
      girlsOnly,
      plus18Only,
      joinedUsers: [
        {
          userID: ownerID,
          joinedAt: new Date(),
        },
      ],
      members: 1,
      img
    })
    const savedRoom = await newRoom.save()

    await User.findByIdAndUpdate(ownerID, {
      $push: {
        rooms: {
          roomID: savedRoom._id,
          joinedAt: new Date(),
        },
      },
    })

    res.status(201).json(savedRoom)
  } catch (error) {
    console.error("Error creating room:", error)
    res.status(500).json({ error: "Internal server error." })
  }
})

router.post('/drop', async (req, res) => {
  const { roomID } = req.body

  if (!roomID) {
    return res.status(400).json({ error: "Room ID is required." })
  }

  try {
    await connect()
    const room = await Room.findById(roomID)
    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }
    await Room.findByIdAndDelete(roomID)

    // Remove room from all joined users
    for (const user of room.joinedUsers) {
      await User.findByIdAndUpdate(user.userID, {
        $pull: {
          rooms: { roomID: roomID },
        },
      })
    }

    res.status(200).json({ message: "Room deleted successfully!" })
  } catch (error) {
    console.error("Error deleting room:", error)
    res.status(500).json({ error: "Internal server error." })
  }
})

router.post('/getInfos', async (req, res) => {
  const { id } = req.body

  if (!id) {
    return res.status(400).json({ message: "Nothing to show :(" })
  }

  try {
    await connect()
    
    // Find Room and populate user info in joinedUsers
    const room = await Room.findById(id).populate("joinedUsers.userID", "username email bio age sex country img")

    if (room) {
      return res.status(200).json({
        room: {
          id: room._id.toString(),
          name: room.name,
          ip: room.ip,
          port: room.port,
          owner: room.owner,
          membersCount: room.members,
          maxMembers: room.maxMembers,
          type: room.type,
          description: room.description,
          boysOnly: room.boysOnly,
          girlsOnly: room.girlsOnly,
          plus18Only: room.plus18Only,
          createdAt: room.createdAt,
          joinedUsers: room.joinedUsers,
        },
      })
    } else {
      return res.status(200).json({ message: "Room not found :(" })
    }
  } catch (error) {
    console.error("Error fetching room:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
})

router.get('/getOwnRooms', async (req, res) => {
  try {
    await connect()
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    const rooms = await Room.find({ ownerID: userId })

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found" })
    }

    return res.status(200).json(rooms)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

router.get('/getRooms', async (req, res) => {
  try {
    await connect()
    const { userId } = req.query

    const rooms = await Room.find({
      "joinedUsers.userID": userId
    }).populate('joinedUsers.userID', 'username email')

    res.status(200).json(rooms)
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error: error.message })
  }
})

router.post('/join', async (req, res) => {
  const { roomId, userId } = req.body

  try {
    await connect()

    // room  exists ?
    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // user exists ?
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // user already joined ?
    const isUserAlreadyJoined = room.joinedUsers.some(u => u.userID.toString() === userId)
    if (isUserAlreadyJoined) {
      return res.status(400).json({ message: "You have already joined this room" })
    }

    // room restrictions
    if (room.boysOnly && user.sex !== "Boy") {
      return res.status(400).json({ message: "This room is only for Boys!" })
    }

    if (room.girlsOnly && user.sex !== "Girl") {
      return res.status(400).json({ message: "This room is only for Girls!" })
    }

    if (room.plus18Only && (!user.age || user.age < 18)) {
      return res.status(400).json({ message: "This room is only for 18+ users!" })
    }

    // room full ?
    if (room.members >= room.maxMembers) {
      return res.status(400).json({ message: "Room full :(" })
    }

    // add user to room
    room.joinedUsers.push({ userID: userId })
    room.members += 1
    await room.save()

    // add room to user
    user.rooms.push({ roomID: roomId })
    await user.save()

    return res.status(200).json({ message: "Successfully joined the room" })
  } catch (error) {
    console.error("Error joining room:", error)
    return res.status(500).json({ message: "Server error" })
  }
})

router.post('/leave', async (req, res) => {
  const { roomID, userID } = req.body

  try {
    await connect()

    // room exists ?
    const room = await Room.findById(roomID)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // user exists ?
    const user = await User.findById(userID)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // remove user mn room
    room.joinedUsers = room.joinedUsers.filter(u => u.userID.toString() !== userID)
    room.members -= 1
    await room.save()

    // remove room mn user
    user.rooms = user.rooms.filter(r => r.roomID.toString() !== roomID)
    await user.save()

    return res.status(200).json({ message: "Successfully left the room" })
  } catch (error) {
    console.error("Error leaving room:", error)
    return res.status(500).json({ message: "Server error" })
  }
})

router.post('/locate', async (req, res) => {
  const { ip, port } = req.body

  if (!ip || !port) {
    return res.status(400).json({ message: "IP and port are required." })
  }

  try {
    await connect()
    const room = await Room.findOne({ ip, port: parseInt(port, 10) })

    if (room) {
      return res.status(200).json({
        room: {
          id: room._id.toString(),
          name: room.name,
          ip: room.ip,
          port: room.port,
          owner: room.owner,
          ownerID: room.ownerID,
          maxMembers: room.maxMembers,
          type: room.type,
          description: room.description,
          boysOnly: room.boysOnly,
          girlsOnly: room.girlsOnly,
          plus18Only: room.plus18Only,
          joinedUsers: room.joinedUsers,
          members: room.members,
          img: room.img,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
      })
    } else {
      return res.status(200).json({ message: "Room not found!" })
    }
  } catch (error) {
    console.error("Error fetching room:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
})

export default router