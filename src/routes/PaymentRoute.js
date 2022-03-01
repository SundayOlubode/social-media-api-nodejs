const express = require("express");
const { createOrder } = require("../controllers/PaymentController");

const router = express.Router();

// Routes
router.route("/payment/create").post(createOrder);


module.exports = router;