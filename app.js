//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const md5 = require("md5");


const app = express();

// console.log(process.env.API_KEY);

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB");

///////////////////////////////mongoose encryption/////////////////////////////////////
// an object created from mongoose schema class
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

// important!!
// const secret = "Thisisourlittlesecret";

// ecrypted only certain field
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });
///////////////////////////////////////////////////////////////////////////////////////////

const User = new mongoose.model("User", userSchema);

// home page
app.get("/", function(req, res) {
  // use home.ejs to render the home page
  res.render("home");
});

// login page
app.get("/login", function(req, res) {
  res.render("login");
});

// register page
app.get("/register", function(req, res) {
  res.render("register");
});


// only if user signed register page, input his email & password, will render secrets page
app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password)
  });
  // when call save, a. store to mongodb; b. encrypt password
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

// validate if the database has such a user
app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = md5(req.body.password);
  // decrypt password when call find
  User.findOne({email: username}, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          console.log(foundUser.password);
          res.render("secrets");
        }
      }
    }
  });
});



app.listen(3000, function() {
  console.log("The server has been started at port 3000 successfully!");
});
