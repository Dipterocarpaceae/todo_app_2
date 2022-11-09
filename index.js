const express = require("express"),
  app = express(),
  port = 3000,
  mongoose = require("mongoose"),
  TodoTask = require("./models/TodoTask"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  User = require("./models/user"),
  Swal = require("sweetalert2");

app.use("/static", express.static("public"));
app.use(
  require("express-session")({
    secret: "Any normal Word", //decode or encode session
    resave: false,
    saveUninitialized: false,
  })
);

passport.serializeUser(User.serializeUser()); //session encoding
passport.deserializeUser(User.deserializeUser()); //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

//connection to db
mongoose.connect("mongodb://localhost:27017/todo_app", (err) => {
  if (err) throw err;
  console.log("connected to MongoDB");
  app.listen(port, () => {
    console.log(`Listening to http://localhost:${port}`);
  });
});

app.set("view engine", "ejs");

//Auth Routes
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// GET METHOD
app.get("/", isLoggedIn, (req, res) => {
  TodoTask.find({}, (err, tasks) => {
    res.render("todo.ejs", { todoTasks: tasks });
  });
});

//GET SINGLE TODO
app
  .route("/detail/:id")
  .get(isLoggedIn, (req, res) => {
    const id = req.params.id;
    TodoTask.findOne({ _id: id }, (err, tasks) => {
      res.render("todoDetail.ejs", { todoTasks: tasks, idTask: id });
    });
  })
  .post(isLoggedIn, (req, res) => {
    const id = req.params.id;
    TodoTask.findByIdAndUpdate(id, { content: req.body.content }, (err) => {
      if (err)
        return res.status(400).json({
          error: "something went wrong while updating",
        });
      res.redirect("/");
    });
  });

//POST METHOD
app.post("/", isLoggedIn, async (req, res) => {
  const todoTask = new TodoTask({
    content: req.body.content,
  });
  try {
    await todoTask.save();
    res.redirect("/");
  } catch (err) {
    return res.status(400).json({
      error: "something went wrong",
    });
    res.redirect("/");
  }
});

//UPDATE
app
  .route("/edit/:id")
  .get(isLoggedIn, (req, res) => {
    const id = req.params.id;
    TodoTask.find({}, (err, tasks) => {
      res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
    });
  })
  .post(isLoggedIn, (req, res) => {
    const id = req.params.id;
    TodoTask.findByIdAndUpdate(id, { content: req.body.content }, (err) => {
      if (err)
        return res.status(400).json({
          error: "something went wrong while updating",
        });
      res.redirect("/");
    });
  });

//DELETE
app.route("/remove/:id").get(isLoggedIn, (req, res) => {
  const id = req.params.id;
  TodoTask.findByIdAndRemove(id, (err) => {
    if (err)
      return res.status(400).json({
        error: "something went wrong while deleting",
      });
    res.redirect("/");
  });
});

//DELETE ALL
app.route("/removeAll").get(isLoggedIn, (req, res) => {
  TodoTask.deleteMany({}, (err) => {
    if (err)
      return res.status(400).json({
        error: "something went wrong while deleting",
      });
    res.redirect("/");
  });
});

//=======================
//      R O U T E S AUTHENTICATION
//=======================

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  function (req, res) {
    res.send(res);
  }
);
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  User.register(new User({ username: req.body.username, name: req.body.name, email: req.body.email, password: req.body.password }), req.body.password, function (err, user) {
    if (err) {
      return res.status(400).json({
        error: "something went wrong",
      });
      res.render("register");
    }
    passport.authenticate("local")(req, res, function () {
      res.redirect("/login");
    });
  });
});

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
