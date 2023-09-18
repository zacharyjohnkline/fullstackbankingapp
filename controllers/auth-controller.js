const User = require('../models/user-model');
const catchAsync = require('./../utils/catch-async');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util')


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;
    
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
};

exports.postUser = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        balance: 1000,
        movements: [],
        favoriteColor: req.body.favoriteColor
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1) Check if email and password actually exist

    if(!email || !password){
        return next(new AppError(400, "Must include email and password to login!"));
    }

    //2) Check if the user exist and at the sametime if the password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError(401, "Incorrect email or password!"));
    }

    // console.log(req.body);

    createSendToken(user, 200, res);

});

exports.protect = catchAsync(async (req, res, next) => {
    // console.log(req.headers.authorization);
    let token;
    // 1) Get the token and check if it's there
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];

    }else if(req.cookies.jwt) {
        token = req.cookies.jwt;
        // console.log(token);
    }

    if(!token){
        return next(new AppError(401, "You are not logged in! Please log in to get access."));
    }
    //2) Validate the token.
    const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    // console.log(freshUser);

    if(!freshUser) {
        return next(new AppError(401, "The User belonging to the token no longer exists!"));
    }
    next();
   
});

exports.protectUser = catchAsync(async (req, res, next) => {
    // console.log(req.headers.authorization);
    let token;
    // 1) Get the token and check if it's there
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];

    }else if(req.cookies.jwt) {
        token = req.cookies.jwt;
        // console.log(token);
    }

    if(!token){
        return next(new AppError(401, "You are not logged in! Please log in to get access."));
    }
    //2) Validate the token.
    const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    // console.log(freshUser);

    if(!freshUser) {
        return next(new AppError(401, "The User belonging to the token no longer exists!"));
    }
    res.status(200).json({
        status: "success",
        data: {
            user: freshUser
        }
    });
   
});