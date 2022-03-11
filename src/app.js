const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const errorMiddleware = require("./middlewares/errorMiddleware");
const helmet = require("helmet");
const compression = require("compression");
const fileUpload = require("express-fileupload");

const app = express();


// Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());


// Routes
const userRoute = require('./modules/user/routes');
const postRoute = require('./modules/post/routes');
// const post = require("./routes/PostRoute");
// const user = require("./routes/UserRoute");
// const payment = require("./routes/PaymentRoute");

app.use("/api/v1", userRoute);
app.use("/api/v1", postRoute);
// app.use("/api/v1", post);

// app.use("/api/v1", payment);


// Static file

app.route('/').get(function (req, res) {
    res.sendFile(process.cwd() + '/index.html')
})


// Middleware for Errors
app.use(errorMiddleware);


module.exports = app;