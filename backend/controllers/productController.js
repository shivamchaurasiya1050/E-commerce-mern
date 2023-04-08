const Product =require("../model/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncError= require("../middleware/catchAsyncError");
const ApiFeatures=require("../utils/apifeature")
const cloudinary = require("cloudinary");

//create product--Admin
exports.createProduct= catchAsyncError(async (req,res,next)=>{
    req.body.user=req.user.id;

    let images=[];
    if(typeof req.body.images==="String"){
      images.push(req.body.images);
    }else{
        images=req.body.images;
    }

    const imagesLink=[];
    for (let i = 0; i < images.length; i++) {
        const result= await cloudinary.v2.uploader.upload(images[i],{
            folder: "products",
        });
        imagesLink.push({
            public_id:result.public_id,
            url:result.secure_url,
        })
        
    }
    req.body.images=imagesLink;
    req.body.user=req.user.id;
    const product= await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    });
});
 //get all product________
exports.getAllProducts= catchAsyncError(async (req,res,next)=>{
 
    const resultPerPage=8;
    const productsCount= await Product.countDocuments();

    const apiFeature= new ApiFeatures(Product.find(),req.query)
    .search()
    .filter();
    let products =await apiFeature.query;
    let filteredProductsCount = products.length;
    apiFeature.pagination(resultPerPage);
    //products= await apiFeature.query;

    res.status(200).json({
        success:true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

//get all product________(Admin)
exports.getAdminProducts= catchAsyncError(async (req,res)=>{
 const products=await Product.find();
   
    res.status(200).json({
        success:true,
        products,
       
    })
});


//get product details-----------

exports.getProductDetails=catchAsyncError(async (req,res,next)=>{
    const product=await Product.findById(req.params.id);
    // console.log(product);
    if(!product){
        return next( new ErrorHander("Product Not Found",404))
    }
    await res.status(200).json({
        success:true,
            product,
    
    })
});

// update product---Admin.

exports.UpdateProduct=catchAsyncError(async (req ,res,next)=>{
    let product= await Product.findById(req.params.id);
    if(!product){
        return next( new ErrorHander("Product Not Found",404))
    }

// images start here
    let images=[];
    if(typeof req.body.images==="String"){
      images.push(req.body.images);
    }else{
        images=req.body.images;
    }

    if(images !==undefined){
       // Deleting images from cloudinary

    for (let i = 0; i <images.length; i++) {
       const result= await cloudinary.v2.uploader.destroy(product.images[i],{
            folder:"products"
        });
       
        imagesLink.push({
            public_id:result.public_id,
            url:result.secure_url,
        })
   } 
   req.body.images=imagesLink; 
 }
     product = await Product.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        });
        res.status(201).json({
            success:true,
            product
        })
    
});

//delete products------------

exports.DeleteProduct=catchAsyncError(async(req,res,next)=>{
    const product= await Product.findById(req.params.id);
    if(!product){
        return next( new ErrorHander("Product Not Found",404))
    }

    // Deleting images from cloudinary

    for (let i = 0; i < product.images.length; i++) {
        const result= await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        
    }
        await product.remove();
        res.status(200).json({
            success:true,
            message:"Product deleted successfully"
        })


});

//create new review or update review:

exports.createProductReview=catchAsyncError(async(req,res,next)=>{
    const {rating , comment ,productId}=req.body;
    const review={
        user:req.body.id,
        user:req.body.name,
        rating:Number(rating),
        comment,
    } ;

    const product= await Product.findById(productId);

    const isReviewed= product.reviews.find((rev)=>rev.user.toString()===rev.user._id.toString());

    if(isReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString()===rev.user._id.toString())
            (rev.rating=rating),(rev.comment=comment);
        });
    }else{
        product.reviews.push(review);
        product.numOfReviews=product.reviews.length         
    }
    let avg=0;
    product.ratings=product.reviews.forEach((rev)=>{
        avg+=rev.rating;
    })

    product.ratings=avg
product.reviews.length;

    await product.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
    })
    
})

//get all reviews of a product;;

exports.getProductReviews=catchAsyncError(async(req,res,next)=>{
    const product= await Product.findById(req.query.id);
    if(!product){
        return next(new ErrorHander("Product Not Found",404));
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews,
    });
});

// Delete Reviews
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
      return next(new ErrorHander("Product not found", 404));
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
});


