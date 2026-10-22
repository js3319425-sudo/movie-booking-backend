const { validationResult } = require("express-validator")
const { getdb } = require("../../db/db")
const { apiError, apiResponse } = require("../../helpers/response")
const { ObjectId } = require("mongodb")

const addTheatre = async (req, res) => {
    try {
        const { Theatre_Name, location, address } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return apiError({ res, status: 422, message: "validation errro", error: errors.array() })
        }

        let db = getdb()
        const existTheatre = await db.collection("theatre").findOne({ status: 1, Theatre_Name, location, address })

        if (existTheatre) {
            return apiError({ res, status: 401, message: "Theatre already exist!" })
        }

        let date = Date.now()

        await db.collection("theatre").insertOne({
            Theatre_Name,
            location,
            address,
            status: 1,
            created_at: date,
            updated_at: date
        })

        return apiResponse({ res, status: 200, message: "Theatre added successfully!" })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

const updateTheatre = async (req, res) => {
    try {
        const { Theatre_Name, location, address } = req.body
        const { id } = req.params
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return apiError({ res, status: 422, message: "validation errro", error: errors.array() })
        }

        let db = getdb()
        const existTheatre = await db.collection("theatre").findOne({ status: 1, _id: new ObjectId(id) })

        if (!existTheatre) {
            return apiError({ res, status: 401, message: "Update Data Not Found!" })
        }

        let date = Date.now()

        await db.collection("theatre").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    Theatre_Name,
                    location,
                    address,
                    status: 1,
                    updated_at: date
                }
            }
        )

        return apiResponse({ res, status: 200, message: "Theatre Update Successfully!" })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

const deleteTheatre = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return apiError({ res, status: 422, message: "id is required!" })
        }

        let db = getdb()
        let existData = await db.collection("theatre").findOne({ _id: new ObjectId(id), status: 1 })

        if (!existData) {
            return apiError({ res, status: 401, message: "Delete Data Not Found!" })
        }

        await db.collection("theatre").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 0
                }
            }
        )

        return apiResponse({ res, status: 200, message: "Thetre Delete successfully!" })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

const fetchSingleTheatre = async (req, res) => {
    try {
        const { id } = req.query

        let db = getdb()

        let theatreData
        if (id) {
            theatreData = await db.collection("theatre").findOne({ status: 1, _id: new ObjectId(id) })
        }
        else {
            theatreData = await db.collection("theatre").aggregate([
                {
                    $match: {
                        status: 1
                    }
                },
                {
                    $sort: {
                        created_at: -1
                    }
                },
                {
                    $project: {
                        Theatre_Name: 1,
                        _id: 1
                    }
                }
            ]).toArray()
        }


        return apiResponse({ res, status: 200, message: theatreData?.Theatre_Name ? "Data fetch successfully!" : "data not found!", data: theatreData })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

const fetchTheatre = async (req, res) => {
    try {
        const { page = 1, limit = 5, search } = req.query
        const skip = (page - 1) * limit
        const perPage = Number(page)
        const perPageLimit = Number(limit)

        let filter = {
            status: 1
        }

        if (search) {
            filter.$or = [
                {
                    Theatre_Name: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    address: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ]
        }

        let db = getdb()

        const countDocuments = await db.collection("theatre").countDocuments(filter)

        const theatre = await db.collection("theatre").aggregate([
            {
                $match: filter
            },
            {
                $sort: {
                    created_at: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: perPageLimit
            }
        ]).toArray()


        return apiResponse({
            res, status: 200, message: "Theatre fetch successfully!", data: {
                theatre,
                pagination: {
                    totalRecord: countDocuments,
                    page: perPage,
                    limit: perPageLimit,
                    totalPage: Math.ceil(countDocuments / limit)
                }
            }
        })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

module.exports = {
    addTheatre,
    updateTheatre,
    deleteTheatre,
    fetchSingleTheatre,
    fetchTheatre
}