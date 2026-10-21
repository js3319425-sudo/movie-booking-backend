const multer = require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.memoryStorage();

const filterFile = (req, file, cb) => {
    let allowMimType = ["image/jpeg", "image/jpg"]
    if (!allowMimType.includes(file.mimetype)) {
        cb(null, true)
    }
    else {
        cb(new Error["only jpg and jpeg are allowed!"], false)
    }
}

const upload = multer({
    storage: storage,
    filterFile: filterFile
})

module.exports = upload

