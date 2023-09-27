const fs = require("fs")
const path = require("path")
const https = require("https")
const helmet = require("helmet") 
const express = require("express")

const PORT = 5000

const app = express()

app.use(helmet())

app.get("/secret", (req,res) => {
    return res.send("Your code is 202300")
})

app.get("/",(req, res) => {
    res.sendFile(path.join(__dirname,"index.html"))
})

https.createServer({
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
}, app).listen(PORT, () =>  {
    console.log("SERVER IS RUNNING ")
})