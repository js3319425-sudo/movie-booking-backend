const express = require("express")
const route = express.Router()
const { login } = require("../controllers/authController/auth")
const movieController = require("../controllers/adminController/admin")
const { addMovieValidation, addTheatreValidation } = require("../helpers/movieVlidation")
const upload = require("../middleware/multer")



// auth route 
route.post("/login", login)

// movie route
route.post("/addMovie", upload.single("image"), addMovieValidation, movieController.addMovie)
route.post("/addTheatre", addTheatreValidation, movieController.addTheatre)

module.exports = route