const { validationResult } = require("express-validator")
const { getdb } = require("../../db/db")
const { apiError, apiResponse } = require("../../helpers/response")
const uploadToCloudinary = require("../../middleware/uploadToCloudinary ")


const addMovie = async (req, res) => {
    try {
        const { movie_name, description, duration, language } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return apiError({ res, status: 422, message: "Validation error", error: errors.array() })
        }

        if (!req.file) {
            return apiError({ res, status: 422, message: "poster  is required!" })
        }

        const poster = await uploadToCloudinary(req.file, "moviez");

        if (!poster?.secure_url) {
            return apiError({ res, status: 422, message: "poster upload failed" })
        }

        let db = getdb()
        const existMovie = await db.collection("movie").findOne({ movie_name, status: 1 })

        if (existMovie) {
            return apiError({ res, status: 400, message: "movie already exist" })
        }

        let date = Date.now()
        await db.collection("movie").insertOne({
            movie_name,
            description,
            duration,
            language,
            poster: poster?.secure_url,
            status: 1,
            created_at: date,
            updated_at: date
        })

        return apiResponse({ res, status: 200, message: "movie added successfuly!" })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error!", error: error?.message })
    }
}

const addTheatre = async (req, res) => {
    try {
        const { Theatre_Name, location, address } = req.body

        let errors = validationResult(req)

        if (!errors.isEmpty()) {
            return apiError({ res, status: 422, message: "Validation Error", error: errors.array() })
        }

        let db = getdb()
        const existTheatre = await db.collection("theatre").findOne({ Theatre_Name, status: 1 })

        if (existTheatre) {
            return apiError({ res, status: 401, message: "Theatre already exist!" })
        }

        let date = new Date()

        await db.collection("theatre").insertOne({
            Theatre_Name,
            location,
            address,
            status: 1,
            created_at: date,
            updated_at: date
        })

        return apiResponse({ res, status: 200, message: "Theatre create successfully!" })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}


module.exports = {
    addMovie,
    addTheatre
}