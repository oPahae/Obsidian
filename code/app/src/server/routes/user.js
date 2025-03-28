import express from 'express'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Room from '../models/Room.js'
import connect from '../lib/connect.js'

const router = express.Router()

router.get('/getInfos', async (req, res) => {
  try {
    await connect()
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal Server Error" })
  }
})

router.post('/updateInfos', async (req, res) => {
  const { userId, updatedValues, img } = req.body

  if (!userId || !updatedValues) {
    return res.status(400).json({ error: "Missing required fields." })
  }

  try {
    await connect()

    // Include image if passed in the request
    if (img) {
      updatedValues.img = img
    }

    // Update user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedValues },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." })
    }

    return res.status(200).json({ 
      message: "User updated successfully.", 
      user: updatedUser 
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return res.status(500).json({ error: "Internal server error." })
  }
})

router.delete('/drop/:id', async (req, res) => {
  try {
    await connect()
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    // Remove user from all rooms they've joined
    for (const room of user.rooms) {
      await Room.findByIdAndUpdate(room.roomID, {
        $pull: { joinedUsers: { userID: id } },
        $inc: { members: -1 },
      })
    }

    // Delete the user
    await User.findByIdAndDelete(id)

    res.status(200).json({ message: "User account deleted successfully!" })
  } catch (error) {
    console.error("Error deleting user account:", error)
    res.status(500).json({ message: "Internal server error." })
  }
})

export default router