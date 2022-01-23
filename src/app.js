const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const errorMiddleware = require("./middlewares/error");
const helmet = require("helmet");
const compression = require("compression");
const path = require('path');

const app = express();


// Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));


// Routes
const post = require("./routes/PostRoute");
const user = require("./routes/UserRoute");

app.use("/api/v1", post);
app.use("/api/v1", user);


// Static file

app.route('/').get(function (req, res) {
    res.sendFile(process.cwd() + '/index.html')
})


// Middleware for Errors
app.use(errorMiddleware);


module.exports = app;