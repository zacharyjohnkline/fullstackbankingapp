// const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "All Users must provide a first name"],
        validate: [validator.isAlpha, "A name can only have letters in its name!"]
    },
    lastName: {
        type: String,
        required: [true, "All Users must provide a last name"],
        validate: [validator.isAlpha, "A name can only have letters in its name!"]
    },
    movements: [{
        amount: {type: String},
        date: {type: String}
    }],
    email: {
        type: String,
        required: [true, "All Users must provide an email"],
        validate: [validator.isEmail, "Must provide a vaild email address"],
        unique: true,
        lowercase: true 
    },
    password: {
        type: String,
        required: [true, "All Users must provide a password"],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            //Only works on .CREATE() and .SAVE()!!!!
            validator: function(value) {
               return value === this.password;
            },
            message: "Passwords do not match"
        }
    },
    balance: {
        type: Number,
        required: [true, "All accounds must have a balance"]
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    favoriteColor: {
        type: String
    }
});

userSchema.pre('save', async function(next) {
    // identify if password is being modified
    if(!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Get rid of password confirm
    this.passwordConfirm = undefined;

    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;