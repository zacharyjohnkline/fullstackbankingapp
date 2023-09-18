const AppError = require('./../utils/appError');

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    console.log(message);
    return new AppError(400, message);
}

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(400, message);
};

const handleDuplicateFieldsDB = (err) => { 
    const value = Object.values(err.keyValue)[0];
    const keys = Object.keys(err.keyValue)[0];
    console.log(value);
    const message = "Email is already in use!";
    return new AppError(400, message);
}

const sendProdError = (err, res) => {
    //Operational Error, trusted error:  send message to the client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });

    //Programming or other unknown error: don't leak error details
    }else if(err.kind === 'ObjectId'){
        res.status(400).json({
            status: "error",
            message: "Invalid Account Number"
        })
    }
    else{
        //1) Log Error
        console.error("ERROR!", err);

        //2) Send a generic message
        res.status(500).json({
            status: "error",
            message: "Something went wrong!"
        })
    }
};


module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    let error = {...err};
    if(error.name === "CastError") error = handleCastErrorDB(error);
    if(error.code === 11000) error = handleDuplicateFieldsDB(error);
    if(error._message === "Validation failed") error = handleValidationErrorDB(error);
    if(error.name === "JsonWebTokenError") error = handleJWTError(error);
    if(error.name === "TokenExpiredError") error = handleJWTExpired();
    sendProdError(error, res);

};