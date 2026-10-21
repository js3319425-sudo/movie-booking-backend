const express = require("express")
const app = express()
const cors = require("cors")
const morgan = require("morgan")
const path = require("path")
const { connect } = require("../backend/db/db")
const appRoutes = require("../backend/routes/routes")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan())
app.use(express.static(path.join(__dirname, "public")))

app.use("/api", appRoutes)

const startSever = async () => {
    let port = process.env.port || 3030
    await connect()
    app.listen(port, () => {
        console.log(`server running on ${port}`)
    })
}

startSever()