const fs = require("fs")
const path = require("path")
const https = require("https")
const helmet = require("helmet") 
const express = require("express")
const passport = require("passport")
const { Strategy } = require("passport-google-oauth20")
require("dotenv").config()

const PORT = 5000
const app = express()

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET
}


const AUTH_OPTIONS = {
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
}
console.log(config)
function verifyCallback(accessToken, refreshToken, profile, done){
    console.log("Google profile", profile)
    done(null, profile)
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))

app.use(helmet())
app.use(passport.initialize())

function checkLoggedIn(req,res,next){
    const isLogged = true
    if(!isLogged){
        return res.status(401).json({
            error: "You must log in!"
        })
    }
    next()
}

app.get("/auth/google",
    passport.authenticate("google", {
        scope: ["email"],
    }))

app.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/failure",
        successRedirect: "/",
        session: false
     }),
    (req, res) =>{
        console.log("Google called us back")
    })

app.get("/auth/logout", (req, res) => {})

app.get("/secret", checkLoggedIn, (req,res) => {
    return res.send("Your code is 202300")
})

app.get("/failure", (req,res) => {
    res.send("hi")
})

app.get("/",(req, res) => {
    res.sendFile(path.join(__dirname,"index.html"))
})

https.createServer({
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
}, app).listen(PORT, () =>  {
    console.log(`server running on PORT ${PORT}...`)
})