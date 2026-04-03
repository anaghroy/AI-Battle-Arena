import express from "express";
import battleRouter from "./routes/battle.route.js";

const app = express()

app.use(express.json())

app.use("/api/battle", battleRouter)

app.get("/heath", (req, res)=>{
    res.json({message: "Server is running"})
})

export default app