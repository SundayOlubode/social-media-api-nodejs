const app = require("./app");
const { connectDatabase } = require("./config/database");
const cloudinary = require("cloudinary");


// Handling Uncaught Exception
process.on("uncaughtException", err => {

    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);

    server.close(() => {
        process.exit(1);
    })

});


// Config
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({
        path: "src/config/config.env"
    });
}


// Connecting to DB
connectDatabase();


// Cloudinary Setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})


// Unhandled Promise Rejection
process.on("unhandledRejection", err => {

    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    })

});