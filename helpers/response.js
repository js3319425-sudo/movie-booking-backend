
const apiResponse = ({ res, status, success = true, message = "sucess", data = null }) => {
    return res.status(status).json({
        success,
        message,
        data
    })
}

const apiError = ({ res, status, success = false, message = "Internal server error!", error = null }) => {
    return res.status(status).json({
        success,
        message,
        error
    })
}

module.exports = {
    apiResponse,
    apiError
}