const { validationResult } = require("express-validator")
const { getdb } = require("../../db/db")
const { apiError, apiResponse } = require("../../helpers/response")
const { ObjectId } = require("mongodb")

const addScreen = async (req, res) => {
    try {
        const { theatre_id, screen_name, nOofRow, seatPerRow } = req.body

        let errors = validationResult(req)

        if (!errors.isEmpty()) {
            return apiError({ res, status: 422, message: "Validation Error", error: errors.array() })
        }

        let db = getdb()

        const existScreen = await db.collection('screen').findOne({ status: 1, theatre_id: new ObjectId(theatre_id), screen_name })

        if (existScreen) {
            return apiError({ res, status: 401, message: "screen name already exist!" })
        }

        let date = Date.now()

        await db.collection('screen').insertOne({
            theatre_id: new ObjectId(theatre_id),
            screen_name,
            nOofRow,
            seatPerRow,
            status: 1,
            created_at: date,
            updated_at: date
        })

        return apiResponse({ res, status: 200, message: "screen addedd successfully!" })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

const updateScreen = async (req, res) => {
    try {
        const { theatre_id, screen_name, nOofRow, seatPerRow } = req.body
        const { id } = req.params

        let errors = validationResult(req)

        if (!errors.isEmpty()) {
            return apiError({ res, status: 422, message: "Validation Error", error: errors.array() })
        }

        if (!id) {
            return apiError({ res, status: 422, message: "Id is required!" })
        }

        let db = getdb()
        const existScreen = await db.collection('screen').findOne({ status: 1, _id: new ObjectId(id) })

        if (!existScreen) {
            return apiError({ res, status: 401, message: "Data not found, for update" })
        }

        let date = Date.now()
        await db.collection('screen').updateOne(
            { _id: new ObjectId(id), status: 1 },
            {
                $set: {
                    theatre_id: new ObjectId(theatre_id),
                    screen_name,
                    nOofRow,
                    seatPerRow,
                    status: 1,
                    updated_at: date
                }
            }
        )

        return apiResponse({ res, status: 200, message: "Screen updated successfully!", data: null })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

const deleteScreen = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return apiError({ res, status: 422, message: "Id is required!" })
        }

        let db = getdb()
        const existScreen = await db.collection('screen').findOne({ status: 1, _id: new ObjectId(id) })

        if (!existScreen) {
            return apiError({ res, status: 401, message: "Data not found, for delete" })
        }

        let date = Date.now()
        await db.collection('screen').updateOne(
            { _id: new ObjectId(id), status: 1 },
            {
                $set: {
                    status: 0,
                    updated_at: date
                }
            }
        )

        return apiResponse({ res, status: 200, message: "screen delete successfully!", data: null })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

const fetchScreenById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return apiError({ res, status: 422, message: "Id is required!" })
        }

        let db = getdb()
        const screen = await db.collection('screen').findOne({ status: 1, _id: new ObjectId(id) })
        console.log(screen)

        return apiResponse({
            res, status: 200,
            message: screen?._id ? "screen fetch successfully!" : "screen not found!",
            data: screen
        })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

const fetchScreen = async (req, res) => {
    try {
        const { page = 1, limit = 5, search } = req.query
        const skip = (page - 1) * limit
        const perPage = Number(page)
        const pageLimit = Number(limit)

        let filter = {
            status: 1
        }

        if (search) {
            filter.$or = [
                {
                    screen_name: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {

                }
            ]
        }

        let db = getdb()

        const countDocuments = await db.collection('screen').countDocuments(filter)

        console.log(countDocuments)

        const screenList = await db.collection('screen').aggregate([
            {
                $match: filter
            },
            
            {
                $lookup: {
                    from: "theatre",
                    localField: "theatre_id",
                    foreignField: "_id",
                    as: "theatredetails"
                }
            },

            {
                $match: {
                    "theatredetails.Theatre_Name": {
                        $regex: search,
                        $options: 'i'
                    }

                }
            },

            {
                $unwind: {
                    path: "$theatredetails",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $project: {
                    "theatredetails.Theatre_Name": 1,
                    "theatredetails._id": 1,
                    "theatre_id": 1,
                    "screen_name": 1,
                    "nOofRow": 1,
                    "seatPerRow": 1,
                    "status": 1,
                }
            },
            {
                $sort: {
                    updated_at: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: pageLimit
            }
        ]).toArray()

        return apiResponse({
            res, status: 200, message: "screen list fetch successfully!",
            data: {
                screenList,
                pagination: {
                    totalRecord: countDocuments,
                    page: perPage,
                    limit: pageLimit,
                    totalPage: Math.ceil(countDocuments / limit)
                }
            }
        })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}
module.exports = {
    addScreen,
    updateScreen,
    deleteScreen,
    fetchScreenById,
    fetchScreen
}