const { getdb } = require("../../db/db")
const { apiError, apiResponse } = require("../../helpers/response")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return apiError({ res, status: 422, message: "Email and Password are required!" })
        }

        let db = getdb()

        const existUser = await db.collection("admin").findOne({ email, status: 1 })

        if (!existUser) {
            return apiError({ res, status: 404, message: "Email  Does't Exist!" })
        }

        const comparePassword = await bcrypt.compare(password, existUser.password)

        if (!comparePassword) {
            return apiError({ res, status: 401, message: "Invalid Credentinal!" })
        }

        const tokenData = {
            email: existUser.email,
            status: existUser.status
        }

        let token = jwt.sign(tokenData, process.env.scret_key)


        return apiResponse({ res, status: 200, message: "login successfully!", data: token })
    } catch (error) {
        return apiError({ res, status: 500, message: "Internal Server Error", error: error?.message })
    }
}

module.exports = {
    login
}
