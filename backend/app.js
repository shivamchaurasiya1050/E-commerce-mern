const express=require("express");
const errorMiddleware=require("./middleware/error");
const cookieParser=require("cookie-parser")
const cors =require("cors");
const bodyParser=require("body-parser");
const fileUpload = require("express-fileupload");
const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());

app.use(
    cors({
        origin:"http://localhost:3000",
        methods:["GET","POST","PUT","DELETE"]
    })
)

//route Imports
const product = require("./routes/productroutes.js");
const user=require("./routes/userRoute");
const order = require("./routes/orderRoute")
const payment = require("./routes/paymentRoute.js")

app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
app.use("/api/v1",payment);

//middleware for error
app.use(errorMiddleware);

module.exports=app;