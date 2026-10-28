const { validationResult } = require("express-validator")
const { getdb } = require("../../db/db")
const { apiError, apiResponse } = require("../../helpers/response")
const { ObjectId } = require("mongodb");
const { checkShowTime } = require("../../helpers/apiHelper");


const addShow = async (req, res) => {
    try {
        const {
            movie_id,
            theatre_id,
            screen_id,
            show_date,
            start_time,
            ticket_price
        } = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return apiError({
                res,
                status: 422,
                message: "Validation Error",
                error: errors.array()
            });
        }

        // Validate time format: HH:mm
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!timeRegex.test(start_time)) {
            return apiError({
                res,
                status: 400,
                message: "Invalid start time. Use HH:mm format, e.g. 14:30"
            });
        }

        const movieId = new ObjectId(movie_id);
        const theatreId = new ObjectId(theatre_id);
        const screenId = new ObjectId(screen_id);

        const db = getdb();

        // Check movie
        const existMovie = await db.collection("movie").findOne({
            _id: movieId,
            status: 1
        });

        if (!existMovie) {
            return apiError({
                res,
                status: 404,
                message: "Movie not found!"
            });
        }

        const movieDuration = Number(existMovie.duration);

        if (!Number.isFinite(movieDuration) || movieDuration <= 0) {
            return apiError({
                res,
                status: 400,
                message: "Invalid movie duration"
            });
        }

        // Check theatre
        const existTheatre = await db.collection("theatre").findOne({
            _id: theatreId,
            status: 1
        });

        if (!existTheatre) {
            return apiError({
                res,
                status: 404,
                message: "Theatre not found!"
            });
        }

        // Check screen belongs to this theatre
        const existScreen = await db.collection("screen").findOne({
            _id: screenId,
            theatre_id: theatreId,
            status: 1
        });

        if (!existScreen) {
            return apiError({
                res,
                status: 404,
                message: "Screen not found!"
            });
        }

        const timeCheck = await checkShowTime({
            db,
            theatreId,
            screenId,
            show_date,
            start_time,
            movieDuration
        });

        if (timeCheck?.conflict) {
            return apiError({
                res,
                status: 409,
                message: timeCheck?.message,
                error: timeCheck
            });
        }

        const end_time = timeCheck?.end_time;

        // Insert show only if the requested time is available
        const now = Date.now();

        const result = await db.collection("show").insertOne({
            movie_id: movieId,
            theatre_id: theatreId,
            screen_id: screenId,
            show_date,
            start_time,
            end_time,
            ticket_price,
            status: 1,
            created_at: now,
            updated_at: now
        });

        return apiResponse({
            res,
            status: 201,
            message: "Show added successfully!",
            data: {
                _id: result?.insertedId,
                show_date,
                start_time,
                end_time
            }
        });

    } catch (error) {
        return apiError({
            res,
            status: 500,
            message: "Internal server error",
            error: error?.message
        });
    }
};

const updateShow = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            movie_id,
            theatre_id,
            screen_id,
            show_date,
            start_time,
            ticket_price
        } = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return apiError({
                res,
                status: 422,
                message: "Validation Error",
                error: errors.array()
            });
        }

        // Validate time format
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!timeRegex.test(start_time)) {
            return apiError({
                res,
                status: 400,
                message: "Invalid time format. Use HH:mm"
            });
        }

        const showId = new ObjectId(id);
        const movieId = new ObjectId(movie_id);
        const theatreId = new ObjectId(theatre_id);
        const screenId = new ObjectId(screen_id);

        const db = getdb();

        // Check existing show
        const currentShow = await db.collection("show").findOne({
            _id: showId,
            status: 1
        });

        if (!currentShow) {
            return apiError({
                res,
                status: 404,
                message: "Show not found!"
            });
        }

        // Check movie
        const movie = await db.collection("movie").findOne({
            _id: movieId,
            status: 1
        });

        if (!movie) {
            return apiError({
                res,
                status: 404,
                message: "Movie not found!"
            });
        }

        const movieDuration = Number(movie.duration);

        if (!Number.isFinite(movieDuration) || movieDuration <= 0) {
            return apiError({
                res,
                status: 400,
                message: "Invalid movie duration"
            });
        }

        // Check theatre
        const theatre = await db.collection("theatre").findOne({
            _id: theatreId,
            status: 1
        });

        if (!theatre) {
            return apiError({
                res,
                status: 404,
                message: "Theatre not found!"
            });
        }

        // Check screen belongs to theatre
        const screen = await db.collection("screen").findOne({
            _id: screenId,
            theatre_id: theatreId,
            status: 1
        });

        if (!screen) {
            return apiError({
                res,
                status: 404,
                message: "Screen not found!"
            });
        }

        const timeCheck = await checkShowTime({
            db,
            theatreId,
            screenId,
            show_date,
            start_time,
            movieDuration,
            excludeShowId: showId
        });

        if (timeCheck.conflict) {
            return apiError({
                res,
                status: 409,
                message: timeCheck.message,
                error: timeCheck
            });
        }

        const end_time = timeCheck.end_time;

        // Update show
        const now = Date.now();

        await db.collection("show").updateOne(
            {
                _id: showId,
                status: 1
            },
            {
                $set: {
                    movie_id: movieId,
                    theatre_id: theatreId,
                    screen_id: screenId,
                    show_date,
                    start_time,
                    end_time,
                    ticket_price,
                    updated_at: now
                }
            }
        );

        return apiResponse({
            res,
            status: 200,
            message: "Show updated successfully!",
            data: {
                _id: showId,
                movie_id: movieId,
                theatre_id: theatreId,
                screen_id: screenId,
                show_date,
                start_time,
                end_time,
                ticket_price
            }
        });

    } catch (error) {
        return apiError({
            res,
            status: 500,
            message: "Internal server error",
            error: error?.message
        });
    }
};

const deleteShow = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return apiError({ res, status: 422, message: "id is required!" })
        }

        let db = getdb()
        const existShow = await db.collection('show').findOne({ _id: new ObjectId(id), status: 1 })

        if (!existShow) {
            return apiError({ res, status: 401, message: "show not found!" })
        }

        await db.collection('show').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 0
                }
            }
        )

        return apiResponse({ res, status: 200, message: "show delete successfully!" })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

const fetchShowById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return apiError({ res, status: 422, message: "id is required!" })
        }

        let db = getdb()
        const existShow = await db.collection('show').aggregate([
            {
                $match: {
                    _id: new ObjectId(id),
                    status: 1
                }
            },

            {
                $lookup: {
                    from: "movie",
                    localField: "movie_id",
                    foreignField: "_id",
                    as: "movieDetails"
                }
            },

            {
                $unwind: {
                    path: "$movieDetails",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "screen",
                    localField: "screen_id",
                    foreignField: "_id",
                    as: "screenDetails"
                }
            },

            {
                $unwind: {
                    path: "$screenDetails",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "theatre",
                    localField: "theatre_id",
                    foreignField: "_id",
                    as: "theatreDetails"
                }
            },

            {
                $unwind: {
                    path: "$theatreDetails",
                    preserveNullAndEmptyArrays: true
                }
            }

        ]).toArray()

        return apiResponse({ res, status: 200, message: "data fetch successfully!", data: existShow })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

const showList = async (req, res) => {
    try {
        const { page = 1, limit = 5, search } = req.query
        const skip = (page - 1) * limit
        const perPage = Number(page)
        const perPageLimit = Number(limit)

        let filter = {
            status: 1,
        }

        if (search) {
            filter.$or = [
                {
                    ["movieDetails.movie_name"]: {
                        $regex: search,
                        $options: "i"
                    }
                },
            ]
        }

        let db = getdb()
        const countDocuments = await db.collection('show').countDocuments(filter)

        const list = await db.collection('show').aggregate([
            {
                $lookup: {
                    from: "movie",
                    localField: "movie_id",
                    foreignField: "_id",
                    as: "movieDetails"
                }
            },

            {
                $unwind: {
                    path: "$movieDetails",
                }
            },

            {
                $lookup: {
                    from: "screen",
                    localField: "screen_id",
                    foreignField: "_id",
                    as: "screenDetails"
                }
            },

            {
                $unwind: {
                    path: "$screenDetails",
                }
            },

            {
                $lookup: {
                    from: "theatre",
                    localField: "theatre_id",
                    foreignField: "_id",
                    as: "theatreDetails"
                }
            },

            {
                $unwind: {
                    path: "$theatreDetails"
                }
            },

            {
                $match: filter,
            },

            {
                $facet: {
                    data: [
                        {
                            $sort: { _id: -1 }
                        },
                        {
                            $skip: skip
                        },
                        {
                            $limit: perPageLimit
                        }
                    ],
                    totalCount: [
                        {
                            $count: "total"
                        }
                    ]
                }
            }

        ]).toArray()

        const total = list[0].totalCount[0]?.total || 0;

        return apiResponse({
            res, status: 200, message: "show  fetch successfully!", data: {
                list,
                pagination: {
                    totalRecord: total,
                    page: perPage,
                    limit: perPageLimit,
                    totalPage: Math.ceil(total / limit)
                }
            }
        })

    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

module.exports = {
    addShow,
    updateShow,
    deleteShow,
    fetchShowById,
    showList
}