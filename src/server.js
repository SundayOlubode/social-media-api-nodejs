const app = require("./app");
const { connectDatabase } = require("./config/database");


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