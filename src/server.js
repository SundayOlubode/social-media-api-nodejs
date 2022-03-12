const app = require("./app");
const cloudinary = require("cloudinary");
const connectMongoDB = require('./helpers/connect-db');


// Handling Uncaught Exception
process.on("uncaughtException", err => {
    console.log(`Error: ${err.message}`);
    console.log(`[server] shutting down due to Uncaught Exception`);

    server.close(() => {
        process.exit(1);
    })
});


// Config
if (process.env.NODE_ENV !== "prod") {
    require("dotenv").config({
        path: "src/config/config.env"
    });
}


// Cloudinary Setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const port = process.env.PORT || 4000;

(async () => {
    // Connecting to DB
    await connectMongoDB(process.env.MONGO_URI, process.env.DB_NAME);

    // Running server
    app.listen(port, (err) => {

        if (err) {
            console.log(`[server] could not start http server on port: ${PORT}`);
            return;
        }
        console.log(`[server] running on port: ${port}`)
    });
})();


// Unhandled Promise Rejection
process.on("unhandledRejection", err => {

    console.log(`Error: ${err.message}`);
    console.log(`[server] shutting down due to Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    })

});