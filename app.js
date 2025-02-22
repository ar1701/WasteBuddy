if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  const http = require('http');
  const express = require("express");
  const Message = require('./model/Message');
  const socketIO = require('socket.io');
  const mongoose = require("mongoose");
  const path = require("path");
  const axios = require("axios");
  const methodOverride = require("method-override");
  const ejsMate = require("ejs-mate");
  const multer = require("multer");
  const session = require("express-session");
  const calculatePoints = require("./calculatePoint.js");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const MongoStore = require("connect-mongo");
  const passport = require("passport");
  const LocalStrategy = require("passport-local");
  const fs = require("fs");
  const User = require("./model/user");
  const Admin = require("./model/admin");
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const { GoogleAIFileManager } = require("@google/generative-ai/server");
  const { isLoggedIn } = require("./middleware.js");
  const PORT = process.env.PORT;
  const apiKey = process.env.API_KEY;
  const app = express();
  const dbUrl = process.env.ATLASDB_URL;
  const genAI = new GoogleGenerativeAI("apiKey");
  app.locals.AppName = "WMS";
  const fileManager = new GoogleAIFileManager(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const { generateResponse } = require("./test");
  const { storage1, cloudinary } = require("./cloudConfig");
  const Waste = require("./model/waste");
  const upload1 = multer({ storage: storage1 });
  
// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(session(sessionOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));