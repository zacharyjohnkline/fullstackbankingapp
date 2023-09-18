const User = require('./../models/user-model');
const catchAsync = require('./../utils/catch-async');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');


exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: "success",
        data: {
            numUsers: users.length,
            users: users
        }
    })
});

exports.getUser = catchAsync(async(req, res, next) => {
    const user = await User.findById(req.body._id);
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
});


exports.transfer = catchAsync(async (req,res,next) => {
    const {id1, id2, movement } = req.body;
    const user = await User.findById(id1);
    if(!user){
        res.status(400).json({
            status: "fail",
            message: "Invalid Account Number"
        })
        return
    }

    const user1 = await User.findByIdAndUpdate(id1, {$push: {movements: movement}, $inc: {balance: movement.amount}});
    const user2 = await User.findByIdAndUpdate(id2, {$push: {movements: {amount: movement.amount*-1, date: movement.date}}, $inc: {balance: movement.amount*-1}});
       
    res.status(200).json({
        status: "success",
        movements: {transferredTo: user1.movements, transferredFrom: user2.movements},
        data: {
            user1: user1,
            user2: user2
        } 
    })

});

exports.patchUser = catchAsync(async (req, res, next) => {
    const { movement, id } = req.body;
    const user = await User.findById(id);
    if(!user){
        res.status(400).json({
            status: "fail",
            message: "User not found"
        })
        return next();
    }
    const newUser = await User.findByIdAndUpdate(id, {$push: {movements: movement}, $inc: {balance: movement.amount}});
    res.status(200).json({
        status: "success",
        number: newUser.movements.length,
        data: {
            newUser
        }
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    let token = req.cookies.jwt;
    const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const freshUser = await User.findByIdAndDelete(decoded.id);
    
    res.status(204).json({
        status: "success",
        data: null
    })
});

