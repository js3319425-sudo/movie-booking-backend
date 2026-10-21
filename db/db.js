const { MongoClient } = require("mongodb")

let client = new MongoClient(process.env.MONGO_URI)

let db;

const connect = async () => {
    try {
        await client.connect()

        console.log("MongoDb conecction successfuly!")

        db = client.db(process.env.DB_NAME)
        return db
    } catch (error) {
        console.log(`mongodb connection error ${error?.message}`)
    }
}

const getdb = () => {
    return db
}

const getClient = () => {
    return client
}

module.exports = {
    getdb,
    getClient,
    connect
}