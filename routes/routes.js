const express = require("express")
const app = express()
const movieRoute = require("../routes/movieRoutes")
const theatreRoute = require("../routes/theatreRoute")

app.use("/movie", movieRoute)
app.use("/theatre", theatreRoute)

module.exports = app