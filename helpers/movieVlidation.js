
const { checkSchema } = require("express-validator")

const addMovieValidation = checkSchema({
    movie_name: {
        notEmpty: {
            errorMessage: "movie name is required!"
        }
    },
    description: {
        notEmpty: {
            errorMessage: "description is required!"
        }
    },
    duration: {
        notEmpty: {
            errorMessage: "duration is required!"
        }
    },
    language: {
        notEmpty: {
            errorMessage: "language is required!"
        }
    }
})

const addTheatreValidation = checkSchema({
    Theatre_Name: {
        notEmpty: {
            errorMessage: "Theatre Name is required!"
        }
    },
    location: {
        notEmpty: {
            errorMessage: "Location is required!"
        }
    },
    address: {
        notEmpty: {
            errorMessage: "Address is required!"
        }
    }
})

module.exports = {
    addMovieValidation,
    addTheatreValidation
}