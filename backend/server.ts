import app from "./src/app.js"
import connectDB from "./src/config/database.js"
import { connectRedis } from "./src/config/redis.js"

await connectDB()
await connectRedis()

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
