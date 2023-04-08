const catchAsyncError = require("../middleware/catchAsyncError");
const STRIPE_SECRET_KEY=process.env.STRIPE_SECRET_KEY|| "sk_test_51MVJkqSBFARkmytsPuSxfMkttWqKqbcLAnAXkKWkiiJpRFnsd0XkXyz7OfQqgoiULHz6HZplwkJZhgRhuRaLOlUa00gzpOaMgx";
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const STRIPE_API_KEY= process.env.STRIPE_API_KEY||"pk_test_51MVJkqSBFARkmytsICJHW6OeVp32cWN4KkbcNbKeDZjz5zFHcCGvxVUVyYDxfoQJ0BVglJuDRYa8d89stjlc8eS300KMwaYbES";

exports.processPayment = catchAsyncError(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "Ecommerce",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});

exports.sendStripeApiKey = catchAsyncError(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: STRIPE_API_KEY });
  
});