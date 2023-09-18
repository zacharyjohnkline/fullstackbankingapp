const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require(`./app`);
const { Double } = require('mongodb');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }).then(() => {
    console.log('DB connection succssful!');
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listenting on port ${port}`);
});