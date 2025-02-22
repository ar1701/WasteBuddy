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




app.get('/messages/:userId/:otherUserId', async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.userId, receiver: req.params.otherUserId },
        { sender: req.params.otherUserId, receiver: req.params.userId }
      ]
    }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

app.post("/login", async (req, res, next) => {
  passport.authenticate("user-local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return passport.authenticate("admin-local", (err, admin, info) => {
        if (err) return next(err);
        if (!admin) {
          return res.redirect("/login");
        }
        req.logIn(admin, (err) => {
          if (err) return next(err);
          return res.redirect("/admin");
        });
      })(req, res, next);
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/index");
    });
  })(req, res, next);
});


