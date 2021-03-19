const express = require("express");
const passport = require("passport");
const router = express.Router();
const userModel = require("./users");
const tweetModel = require("./tweets");
const localStrategy = require("passport-local");

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index");
});

router.post("/reg", function (req, res) {
  const dets = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  });

  userModel.register(dets, req.body.password).then(function (registeredUser) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.get("/profile", isLoggedIn, function (req, res) {
  res.send("soon to the profile page !");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res) {
  req.logOut();
  res.redirect("/");
});

router.post("/posttweet", function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      tweetModel
        .create({
          caption: req.body.caption,
          userId: foundUser._id,
        })
        .then(function (createdTweet) {
          foundUser.tweets.push(createdTweet);
          foundUser.save().then(function (savedValue) {
            res.send(savedValue);
          });
        });
    });
});

router.get("/profile", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .populate("tweets")
    .then(function (foundUser) {
      res.send(foundUser);
    });
});

router.get("/like/:tweetid", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      tweetModel.findById(req.params.tweetid).then(function (foundTweet) {
        if (foundTweet.likes.indexOf(foundUser._id) === -1) {
          foundTweet.likes.push(foundUser._id);
        } else {
          let index = foundTweet.likes.indexOf(foundUser._id);
          foundTweet.likes.splice(index, 1);
        }
        foundTweet.save().then(function (savedTweet) {
          res.send(savedTweet);
        });
      });
    });
});

router.get("/edit/:tweetid", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      tweetModel
        .findById(req.params.tweetid)
        .then(function (foundTweet) {
          if(foundTweet.userId.equals(foundUser._id)){
            // do, edit stuff here
            res.send('show update page !');
          }
          else{
            // this is not your tweet
            res.send('not your tweet');
          }
        });
    });
});

router.post('/edit/:tweetid', isLoggedIn, function(req, res){
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
      tweetModel
        .findById(req.params.tweetid)
        .then(function (foundTweet) {
          if(foundTweet.userId.equals(foundUser._id)){
            // do, edit stuff here
            tweetModel.findOneAndUpdate({_id: req.params.tweetid}, {caption: req.body.caption})
            .then(function(updatedTweet){
              res.send(updatedTweet);
            })
          }
          else{
            // this is not your tweet
            
          }
        });
    });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
