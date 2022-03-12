import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';

import errorHandler from './middleware/error.js';

//ROUTES
import streakRoutes from './routes/streak.js';
import streakDetailRoutes from './routes/streakDetail.js';
import rewardRoute from './routes/reward.js';
import userRoute from './routes/users.js';
import recentActivityRoute from './routes/recentActivities.js';

const app = express();
dotenv.config();
app.use(morgan('dev'))

//Middlewares
app.use(bodyParser.json({ limit: "3mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "3mb", extended: true }));

app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://festive-pasteur-8564bb.netlify.app'
}));

app.options('*', cors())

app.get('/', (req, res) => {
  res.send('HELLO TO  HABSTREAK API');
});

//Routes
app.use('/streak', streakRoutes);
app.use('/streakDetail', streakDetailRoutes);
app.use('/reward', rewardRoute);
app.use('/user', userRoute);
app.use('/recentActivities', recentActivityRoute);

app.use((req , res , next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err); 
})

app.use(errorHandler);

//Connection url
const PORT = process.env.PORT || 5000;

//Connecting to database
const connectionUrl = process.env.NODE_ENV === 'development' ? process.env.CONNECTION_URL : process.env.CONNECTION_URL_PROD
mongoose.connect(connectionUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port : ${PORT}`);
    })
  })
  .catch((error) => {
    console.log(error.message)
  });

mongoose.set('useFindAndModify', false);
