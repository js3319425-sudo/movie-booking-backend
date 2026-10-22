const express = require("express")
const app = express()
const movieRoute = require("../routes/movieRoutes")

app.use("/movie", movieRoute)

module.exports = app