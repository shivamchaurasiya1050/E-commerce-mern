const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../model/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const PASSWORD_URL=process.env.PASSWORD_URL|| "http://localhost:3000"

//Register user;

exports.registerUser = catchAsyncError(async (req, res, next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:"avatars",
        width:150,
        crop:"scale",
    });
    const { name, email, password } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },

    });
    sendToken(user, 201, res);
});

//Login user

exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    //cheching if user has given password and email both
    if (!email || !password) {
        return next(new ErrorHander("Please Enter Email & Password", 400))
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHander("Invalid Email or Password", 401));
    }

    const isPasswordMatched =  await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Invalid Email or Password", 401))
    }

    sendToken(user, 200, res);
})

//Logout user

exports.Logout = catchAsyncError((req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,

    })

    res.status(200).json({
        success: true,
        message: "Logged out",

    });
})

//forget password

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHander("User not found", 404));
    }
    //get reset password token

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${PASSWORD_URL}/password/reset/${resetToken}`;

    const message = `Your password reset token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then,please ignore it `;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHander(error.message, 500));
    }
})

//reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    //createn token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.pramas.token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    })
    if (!user) {
        return next(new ErrorHander("Reset password Token Invalid or has been expire", 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander("Password does not match", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
});

//get user details-

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    //console.log(user)
    res.status(200).json({
        success: true,
        user,
    });
});
// Update User Password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    //console.log(user);
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHander("old Password is not correct", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander(" Password does not match", 400));
    }
    user.password = req.body.newPassword;
    //console.log(req.body.newPassword)
    await user.save();

    sendToken(user, 200, res);

})
//update user Profile.

exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email

    };

    // will be add cloudinary later
    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id);
    
        const imageId = user.avatar.public_id;
    
        await cloudinary.v2.uploader.destroy(imageId);
    
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });
    
        newUserData.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
    
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,

    });

});
//get all user (admin)---
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();
    //console.log(users)
    res.status(200).json({
        success: true,
        users,

    });

});
//get single user (admin):
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return next( new ErrorHander(`User does not exits with id ${req.params.id}`));
    }

    res.status(200).json({
        success: true,
        user,

    });

});

// Update user role ---admin
exports.updateProfileRole = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role:req.body.role,

    };
    let user=await User.findById(req.params.id);
    if(!user){
        return next( new ErrorHander(`user does not exist with Id:${req.params.id}`,400)
        );
}

    
    user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        

    });

});

// Delete user ---admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    //we will remove  cloudinary later
    
    if(!user){
        return next( new ErrorHander(`User does not exits with id ${req.params.id}`));
    };

    await user.remove();
    

    res.status(200).json({
        success: true,
        message:"User Deleted Successfully"

    });

});





