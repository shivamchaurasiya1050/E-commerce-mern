const Order= require("../model/orderModel");
const Product =require("../model/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncError= require("../middleware/catchAsyncError");

//create new order

exports.newOrder=catchAsyncError( async (req,res,next)=>{
    const {shippingInfo,
        orderItems,
        paymentInfo,
        itemsprice,
        taxprice,
        shippingPrice,
        totalPrice}= req.body;

        const order=await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsprice,
            taxprice,
            shippingPrice,
            totalPrice,
            paidAt:Date.now(),
            user:req.user._id,
        });
        res.status(201).json({
            success:true,
            order,
        })
});

//get Single order:

exports.getSingleOrder= catchAsyncError(async(req,res,next)=>{
    const order= await Order.findById(req.params.id).populate("user","name email");

    if(!order){
        return next(new ErrorHander("Order not found with this id",404));
    }

    res.status(201).json({
        success:true,
        order,
    });
});
//get logged in user order
exports.myOrders= catchAsyncError(async(req,res,next)=>{
    const orders= await Order.find({user:req.user._id});
        
        res.status(201).json({
        success:true,
        orders,
    });
});

//get All order Admin;
exports.getAllOrders= catchAsyncError(async(req,res,next)=>{
    const orders= await Order.find();
    let totalAmount=0;
    orders.forEach((order)=>{
        totalAmount+=order.totalPrice;
    });
        
        res.status(201).json({
        success:true,
        totalAmount,
        orders,
    });
});

//update  order Status-- Admin;
exports.updateOrder= catchAsyncError(async (req,res,next)=>{
    const order= await Order.findById(req.params.id);

    if(!order){
        return next( new ErrorHander("You have already delivered this order",400));
    }
    if(order.orderStatus==="Delivered"){
        return next( new ErrorHander("You have already delivered this order",400));
    }
    if (req.body.Status === "Shipped") {

        order.orderItems.forEach(async (order)=>{
            await updateStock(order.product,order.quantity);
           });
        
    }
       

       order.orderStatus=req.body.status;
       if(req.body.status==="Delivered"){
        order.deliveredAt=Date.now();
       }
       await order.save({validateBeforeSave:false});
      
        res.status(201).json({
        success:true,
        order
       
    }); 
});

async function updateStock(id,quantity){
    const product =await Product.findById(id);
    product.Stock-=quantity;
    await product.save({validateBeforeSave:false});
};

//Delete order--- Admin;
exports.deleteOrder= catchAsyncError(async(req,res,next)=>{
    const order= await Order.findById(req.params.id);
    if (!order){
        return next( new ErrorHander(("Order not found with this id",400)))
    }
        await order.remove()
        res.status(201).json({
        success:true,
         order,
    });
});
