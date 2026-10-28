const express = require("express")
const route = express.Router()
const theatreController = require("../../backend/controllers/adminController/AddTheatre")
const { addTheatreValidation } = require("../helpers/movieVlidation")

route.post("/addTheatre", addTheatreValidation, theatreController.addTheatre)
route.post("/updateTheatre/:id", addTheatreValidation, theatreController.updateTheatre)
route.post("/deleteTheatre/:id", theatreController.deleteTheatre)
route.get("/fetchTheatreById/:id", theatreController.fetchSingleTheatre)
route.get("/fetchTheatre", theatreController.fetchTheatre)


module.exports = route