
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

const addScreenValidation = checkSchema({
    theatre_id: {
        notEmpty: {
            errorMessage: "Theatre ID is required!"
        }
    },

    screen_name: {
        notEmpty: {
            errorMessage: "Screen name is required!"
        }
    },

    nOofRow: {
        notEmpty: {
            errorMessage: "Number of rows is required!"
        },
        isNumeric: {
            errorMessage: "Number of rows must be numeric!"
        }
    },

    seatPerRow: {
        notEmpty: {
            errorMessage: "Seats per row are required!"
        },
        isNumeric: {
            errorMessage: "Seats per row must be numeric!"
        }
    }
});


const showValidation = checkSchema({
    movie_id: {
        notEmpty: {
            errorMessage: "Movie Name is required!"
        },
        isMongoId: {
            errorMessage: "Movie ID must be a valid MongoDB ID!"
        }
    },

    theatre_id: {
        notEmpty: {
            errorMessage: "Theatre Name is required!"
        },
        isMongoId: {
            errorMessage: "Theatre ID must be a valid MongoDB ID!"
        }
    },

    screen_id: {
        notEmpty: {
            errorMessage: "Screen Name is required!"
        },
        isMongoId: {
            errorMessage: "Screen ID must be a valid MongoDB ID!"
        }
    },

    show_date: {
        notEmpty: {
            errorMessage: "Show date is required!"
        },
        isISO8601: {
            options: { strict: true },
            errorMessage: "Show date must be in YYYY-MM-DD format!"
        },
        custom: {
            options: (value) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const showDate = new Date(`${value}T00:00:00`);

                if (showDate < today) {
                    throw new Error("Show date cannot be in the past!");
                }

                return true;
            }
        }
    },

    start_time: {
        notEmpty: {
            errorMessage: "Start time is required!"
        },
        matches: {
            options: [/^([01]\d|2[0-3]):[0-5]\d$/],
            errorMessage: "Start time must be in HH:mm format (e.g. 14:30)!"
        }
    },

    ticket_price: {
        notEmpty: {
            errorMessage: "Ticket price is required!"
        },
        isFloat: {
            options: { min: 0.01 },
            errorMessage: "Ticket price must be a number greater than 0!"
        },
        toFloat: true
    }
});

module.exports = {
    addMovieValidation,
    addTheatreValidation,
    addScreenValidation,
    showValidation
}