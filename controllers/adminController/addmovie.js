const { validationResult } = require("express-validator")
const { getdb } = require("../../db/db")
const { apiError, apiResponse } = require("../../helpers/response")
const uploadToCloudinary = require("../../middleware/uploadToCloudinary ")
const { ObjectId } = require("mongodb")


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

const updateMovie = async (req, res) => {
    try {
        const { movie_name, description, duration, language } = req.body
        const { id } = req.params

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return apiError({ res, status: 422, message: "Validation Error", error: errors.array() })
        }

        if (!req.file && !req.body.image) {
            return apiError({ res, status: 422, message: "poster is required!" })
        }

        if (!id) {
            return apiError({ res, status: 422, message: "id is required!" })
        }

        let poster
        if (req.file) {
            poster = await uploadToCloudinary(req.file, "moviez");
        }

        let db = getdb()

        const checkMovie = await db.collection("movie").findOne({ _id: new ObjectId(id), status: 1 })

        if (!checkMovie) {
            return apiError({ res, status: 401, message: "data not found for update!" })
        }

        let date = Date.now()

        await db.collection("movie").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    movie_name,
                    description,
                    duration,
                    language,
                    poster: poster?.secure_url ? poster?.secure_url : req.body.image ? req.body.image : null,
                    status: 1,
                    created_at: date,
                    updated_at: date
                }
            }
        )

        return apiResponse({ res, status: 200, message: "movie updated successfully!" })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error!", error: error?.message })
    }
}

const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return apiError({ res, status: 422, message: "id is required!" })
        }
        let db = getdb()

        const existData = await db.collection("movie").findOne({ _id: new ObjectId(id), status: 1 })

        if (!existData) {
            return apiError({ res, status: 422, message: "data not found!" })
        }

        await db.collection("movie").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 0
                }
            }
        )

        return apiResponse({ res, status: 200, message: "movie deleted successfully!" })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal server error", error: error?.message })
    }
}

const fetchSingleMovie = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return apiError({ res, status: 422, message: "id is required!" })
        }

        let db = getdb()

        const existData = await db.collection("movie").findOne({ _id: new ObjectId(id), status: 1 })

        return apiResponse({ res, status: 200, message: existData?.movie_name ? "data fetch successfully!" : "data not found!", data: existData })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal server error", error: error?.message })
    }
}

const fetchMovie = async (req, res) => {
    try {
        const { page = 1, limit = 5, search } = req.query
        const offset = (page - 1) * limit
        const perPage = Number(page)
        const perPageLimit = Number(limit)

        let filter = {
            status: 1
        }

        if (search) {
            filter.$or = [
                {
                    movie_name: {
                        regexp: search,
                        option: 'i'
                    }
                },

                {
                    language: {
                        regexp: search,
                        option: 'i'
                    }
                },

            ]
        }

        let db = getdb()

        const countDocuments = await db.collection("movie").countDocuments(filter)

        let movie = await db.collection("movie").aggregate([
            {
                $match: filter
            },
            {
                $sort: {
                    created_at: -1
                }
            },
            {
                $skip: offset
            },
            {
                $limit: perPageLimit
            }
        ]).toArray()

        return apiResponse({
            res, status: 200, message: "movie fetch successfully!", data: {
                movie,
                pagination: {
                    totalRecord: countDocuments,
                    page: perPage,
                    limit: perPageLimit,
                    totalPage: Math.ceil(countDocuments / limit)
                }
            }
        })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal server error", error: error?.message })
    }
}


module.exports = {
    addMovie,
    updateMovie,
    deleteMovie,
    fetchSingleMovie,
    fetchMovie
}