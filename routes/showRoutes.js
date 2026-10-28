
const express = require('express')
const route = express.Router()
const showController = require("../controllers/adminController/schedulesshow")
const { showValidation } = require('../helpers/movieVlidation')

route.post("/add-show", showValidation, showController.addShow)
route.post("/update-show/:id", showValidation, showController.updateShow)
route.get("/fetch-showBy/:id", showController.fetchShowById)
route.get("/fetchshowlist", showController.showList)
route.post("/delete-show/:id", showController.deleteShow)


module.exports = route