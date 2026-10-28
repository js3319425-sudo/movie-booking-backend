const express = require("express")
const app = express()
const movieRoute = require("../routes/movieRoutes")
const theatreRoute = require("../routes/theatreRoute")
const screenRoute = require("../routes/screenRoute")
const showRoute = require("./showRoutes")

app.use("/movie", movieRoute)
app.use("/theatre", theatreRoute)
app.use("/screen", screenRoute)
app.use("/show", showRoute)

module.exports = app