import app from "./src/app.js"
import connectDB from "./src/config/database.js"
import { connectRedis } from "./src/config/redis.js"

await connectDB()
await connectRedis()

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
