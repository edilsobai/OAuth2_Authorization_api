const fs = require("fs")
const path = require("path")
const https = require("https")
const helmet = require("helmet") 
const express = require("express")
const passport = require("passport")
const cookieSession = require("cookie-session")
const { Strategy } = require("passport-google-oauth20")
require("dotenv").config()

const PORT = 5000
const app = express()

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2,

}
const AUTH_OPTIONS = {
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    callbackURL: "https://localhost:5000/auth/google/callback",
}

function verifyCallback(accessToken, refreshToken, profile, done){
    console.log("Google profile", profile)
    done(null, profile)
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    done(null, id)
}) 

app.use(helmet())

app.use(cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2]
}))

app.use(passport.initialize())
app.use(passport.session())

function checkLoggedIn(req,res,next){
    console.log("Current user is: ", req.user )
    const isLogged = req.isAuthenticated && req.user
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
        session: true
     }),
    (req, res) => {
        
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