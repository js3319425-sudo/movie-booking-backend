const cloudinary = require("../../backend/config/cloudinary");

const uploadToCloudinary = async (file, folder = "moviez") => {
    if (!file) {
        throw new Error("File is required!");
    }

    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
            folder: folder
        }
    );

    return result;
};

module.exports = uploadToCloudinary;