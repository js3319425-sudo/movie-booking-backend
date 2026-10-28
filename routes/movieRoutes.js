const express = require("express")
const route = express.Router()
const { login } = require("../controllers/authController/auth")
const movieController = require("../controllers/adminController/addmovie")
const { addMovieValidation } = require("../helpers/movieVlidation")
const upload = require("../middleware/multer")


// auth route 
route.post("/login", login)

// movie route
route.post("/addMovie", upload.single("image"), addMovieValidation, movieController.addMovie)
route.post("/updateMovie/:id", upload.single("image"), addMovieValidation, movieController.updateMovie)
route.post("/deleteMovie/:id", movieController.deleteMovie)
route.get("/fetchMovieDetail", movieController.fetchSingleMovie)
route.get("/fetchMovie", movieController.fetchMovie)


module.exports = route