import express from 'express'
import mongoose from 'mongoose'
import Room from '../models/Room.js'
import connect from '../lib/connect.js'

const router = express.Router()

router.post('/getMsgs', async (req, res) => {
  const { id } = req.body

  if (!id) {
    return res.status(400).json({ error: "Room ID is required." })
  }

  try {
    await connect()

    const room = await Room.findById(id)

    if (!room) {
      return res.status(404).json({ error: "Room not found." })
    }

    return res.status(200).json(room.messages)
  } catch (error) {
    console.error("Error fetching room messages:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
})

router.post('/sendMsg', async (req, res) => {
  const { id, message } = req.body

  try {
    await connect()

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Room ID" })
    }

    const room = await Room.findById(id)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    if (!message.userID || !mongoose.Types.ObjectId.isValid(message.userID)) {
      return res.status(400).json({ message: "Invalid User ID" })
    }

    const newMessage = {
      userID: message.userID,
      username: message.username,
      type: message.type,
      content: message.content,
      date: message.date,
      likes: message.likes,
      tags: message.tags,
    }
    room.messages.push(newMessage)
    await room.save()

    res.status(201).json({
      message: "Message sent successfully",
      msg: newMessage,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
})

// async function migrateMessages() {
//   await connect()

//   const rooms = await Room.find()
//   for (const room of rooms) {
//     const messageObjects = room.messages
//     const messageIds = []

//     for (const message of messageObjects) {
//       const newMessage = await Msg.create({
//         userID: message.userID,
//         username: message.username,
//         type: message.type,
//         content: message.content,
//         date: message.date,
//         likes: message.likes,
//         tags: message.tags,
//       })
//       messageIds.push(newMessage._id)
//     }

//     room.messages = messageIds
//     await room.save()
//   }

//   console.log("Migration Done :D")
// }

export default router