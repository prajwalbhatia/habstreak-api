import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import * as cookieParser from "cookie-parser";
import http from "http"; // Import the http module

// Import socket.io
import { Server as SocketServer } from "socket.io";

import errorHandler from "./middleware/error.js";

//ROUTES
import streakRoutes from "./routes/streak.js";
import streakDetailRoutes from "./routes/streakDetail.js";
import rewardRoute from "./routes/reward.js";
import userRoute from "./routes/users.js";
import recentActivityRoute from "./routes/recentActivities.js";
import razorPayRoute from "./routes/razorPay.js";
import supportRoute from "./routes/support.js";

import path from "path";

const __dirname = path.resolve();
const app = express();
dotenv.config();
app.use(morgan("dev"));

//Middlewares
app.use(bodyParser.json({ limit: "3mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "3mb", extended: true }));
app.use(cookieParser.default());

let domains = [
  "http://192.168.29.23:3000",
  "http://192.168.1.49:3000",
  "http://localhost:3000",
  "https://habstreak-preprod.netlify.app",
  "https://habstreak.com",
];

app.use(
  cors({
    origin: domains,
  })
);

app.options("*", cors());

app.get("/", (req, res) => {
  res.send("HELLO TO  HABSTREAK API");
});

app.get("/logo.svg", (req, res) => {
  res.sendFile(path.join(__dirname, "Logo-Icon.svg"));
});

app.get("/habstreak_guide.mp4", (req, res) => {
  res.sendFile(path.join(__dirname, "habstreak_video.mp4"));
});

//Routes
app.use("/streak", streakRoutes);
app.use("/streakDetail", streakDetailRoutes);
app.use("/reward", rewardRoute);
app.use("/user", userRoute);
app.use("/recentActivities", recentActivityRoute);
app.use("/razorpay", razorPayRoute);
app.use("/support", supportRoute);

app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(errorHandler);

//Connection url
const PORT = process.env.PORT || 5000;
const host = "0.0.0.0";

//Connecting to database
const connectionUrl =
  process.env.NODE_ENV === "development"
    ? process.env.CONNECTION_URL
    : process.env.NODE_ENV === "pre-production"
    ? process.env.CONNECTION_URL_PRE_PROD
    : process.env.CONNECTION_URL_PROD;

export let io;

mongoose
  .connect(connectionUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const server = http.createServer(app); // Create HTTP server
    io = new SocketServer(server, {
      cors: { origin: process.env.DOMAIN, methods: ["GET", "POST"] },
    }); // Create Socket.IO server

    server.listen(PORT, host, () => {
      console.log(`Server is running on port : ${PORT}`);
    });

    io.on("connection", function (socket) {
      console.log(`⚡: ${socket.id} user just connected!`);
      // Handle socket events here
    });
  })
  .catch((error) => {
    console.log(error.message);
  });

mongoose.set("useFindAndModify", false);
