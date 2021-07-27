import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import userRoutes from './routes/users.js';
import streakRoutes from './routes/streak.js';
import streakDetailRoutes from './routes/streakDetail.js';
import rewardRoute from './routes/reward.js';


const app = express();
dotenv.config();

//Middlewares
app.use(bodyParser.json({ limit: "3mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "3mb", extended: true }));
app.use(cors());

//Routes
// app.use('/user' , userRoutes);
app.use('/streak', streakRoutes);
app.use('/streakDetail', streakDetailRoutes);
app.use('/reward', rewardRoute);

app.get('/', (req, res) => {
  res.send('Welcome to Code snippet');
});

//Connection url
const PORT = process.env.PORT || 5000;

//Connecting to database
mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port : ${PORT}`);
    })
  })
  .catch((error) => {
    console.log(error.message)
  });

mongoose.set('useFindAndModify', false);
