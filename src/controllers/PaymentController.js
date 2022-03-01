const Razorpay = require('razorpay');
const catchAsyncError = require('../middlewares/catchAsyncError');

exports.createOrder = catchAsyncError( async (req,res,next) => {

    const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET
    });

    const {amount} = req.body;

    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: "order_rcptid_1"
    }

    rzp.orders.create(options, (err, order) => {
        console.log(order);
    })
})