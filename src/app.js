const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const errorMiddleware = require("./middlewares/errorMiddleware");
const helmet = require("helmet");
const compression = require("compression");
const fileUpload = require("express-fileupload");
const cors = require('cors');
const cron = require('node-cron');


exports.runApp = () => {
    const app = express();

    // Middlewares
    app.use(helmet());
    app.use(compression());
    app.use(express.json({ limit: '100mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(fileUpload());
    app.use(cors({
        origin: "*",
        methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
        credentials: true,
        exposedHeaders: ['x-auth-token']
    }));

    const { deleteExpiredOTPs } = require('./modules/user/controllers');

    // Schedule a task
    cron.schedule('59 23 * * *', () => {
        console.log('[cron] task running every day at 11:59 PM')
        deleteExpiredOTPs();
    });


    // Home Page Route
    app.route('/').get(function (req, res) {
        res.sendFile(process.cwd() + '/index.html')
    });

    return app;
}


exports.closeApp = (app) => {
    // Middleware for Errors
    app.use(errorMiddleware);
}