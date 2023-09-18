const express = require('express');
const globalErrorHandler = require('./controllers/error-controller');
const cookieParser = require('cookie-parser');
const swaggerJsDoc =require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const userRouter = require('./routes/user-routes');

const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    info:{
      title: 'Library API',
      version: '1.0.0'
    }
  },
  apis: ['app.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(express.static(`${__dirname}/build`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
  });
/**
 * @swagger
 * /api/v1/users:
 *    get:
 *      description: Get all users
 *      responses:
 *        200:
 *          description: Success
 *    patch:
 *      description: handles the deposits, withdraws, and transfers
 *      parameters:
 *      - name: Account Movements
 *        description: requires the id of the logged in user and the transaction details-- PROTECTED BY JWT
 *        in: body
 *        required: true
 *        type: object
 *      responses:
 *        200:
 *          description: Success
 *    post:
 *      description: adds users to the database
 *      parameters:
 *      - name: Create User
 *        description: Adds a created user to the databse and returns JWT
 *        in: body
 *        required: true
 *        type: object
 *      responses:
 *        200:
 *          description: Success
 *    delete:
 *      description: Deletes a user account
 *      parameters:
 *      - name: Delete User
 *        description: Finds the logged in user by their JWT and deletes their account from the database
 *        in: body
 *        required: true
 *        type: object
 *      responses:
 *        200:
 *          description: Success
 * /api/v1/users/login:
 *    post:
 *      description: logs in the user and returns a JWT
 *      parameters:
 *      - name: Log In User
 *        description: needs email and password -- RETURNS A JWT
 *        in: body
 *        required: true
 *        type: object
 *      responses:
 *        200:
 *          description: Success 
 * /api/v1/users/transfer:
 *    patch:
 *      descripton: transfers money between 2 user accounts and increments the balances, keeps track of the movements
 *      parameters:
 *      - name: Transfer Money
 *        description: needs account ids and the amount --- PROTECTED BY JWT
 *        in: body
 *        required: true
 *        type: object
 *      responses:
 *        200:
 *          description: Success
 * /api/v1/users/singleuser:
 *     post:
 *      description: returns a single user using the JWT -- PROTECTED BY JWT
 *      responses:
 *        200:
 *          description: Success
 */
app.use('/api/v1/users', userRouter);
app.use(globalErrorHandler);

module.exports = app;