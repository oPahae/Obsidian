import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import mongoose from "mongoose"
import connect from './lib/connect.js'

import userRoutes from "./routes/user.js"
import roomRoutes from "./routes/room.js"
import msgRoutes from "./routes/msg.js"

dotenv.config()
const app = express()

app.use(express.json({ limit: '5mb' })) // limit upload dial json
app.use(cors())

await connect()

app.use("/api/user", userRoutes)
app.use("/api/room", roomRoutes)
app.use("/api/msg", msgRoutes)

// middlwaer pour error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: "Something went wrong!", 
    error: process.env.NODE_ENV === 'production' ? {} : err.stack 
  })
})

const PORT = 5000
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app