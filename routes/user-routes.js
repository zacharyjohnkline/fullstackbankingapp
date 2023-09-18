const express = require('express');
const userController = require('./../controllers/user-controller');
const authController = require('./../controllers/auth-controller');
const router = express.Router();

router
    .post('/login', authController.login);
    
router
    .patch('/transfer', authController.protect, userController.transfer);

router
    .route('/singleuser')
    .post(authController.protectUser);
    
router
    .route('/')
    .get(authController.protect, userController.getAllUsers)
    .post(authController.postUser)
    .patch(authController.protect, userController.patchUser)
    .delete(userController.deleteMe);


module.exports = router;