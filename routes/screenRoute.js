const express = require("express")
const route = express.Router()
const screenController = require("../controllers/adminController/addScreen")
const { addScreenValidation } = require("../helpers/movieVlidation")

route.post("/addScreen", addScreenValidation, screenController.addScreen)
route.post("/updateScreen/:id", addScreenValidation, screenController.updateScreen)
route.post("/deleteScreen/:id",  screenController.deleteScreen)
route.get("/fetchScreenBy/:id",  screenController.fetchScreenById)
route.get("/fetchScreen",  screenController.fetchScreen)

module.exports = route