const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const TodoTask = require("./models/TodoTask");

app.use("/static", express.static("public"));
app.use(express.urlencoded({ extended: true }));

//connection to db
mongoose.connect("mongodb://localhost:27017/todo_app", (err) => {
  if (err) throw err;
  console.log("connected to MongoDB");
  app.listen(port, () => {
    console.log(`Listening to http://localhost:${port}`);
  });
});

app.set("view engine", "ejs");

// GET METHOD
app.get("/", (req, res) => {
  TodoTask.find({}, (err, tasks) => {
    res.render("todo.ejs", { todoTasks: tasks });
  });
});

//GET SINGLE TODO
app
  .route("/detail/:id")
  .get((req, res) => {
    const id = req.params.id;
    TodoTask.findOne({ _id: id }, (err, tasks) => {
      res.render("todoDetail.ejs", { todoTasks: tasks, idTask: id });
    });
  })
  .post((req, res) => {
    const id = req.params.id;
    TodoTask.findByIdAndUpdate(id, { content: req.body.content }, (err) => {
      if (err) return res.send(500, err);
      res.redirect("/");
    });
  });

//POST METHOD
app.post("/", async (req, res) => {
  const todoTask = new TodoTask({
    content: req.body.content,
  });
  try {
    await todoTask.save();
    res.redirect("/");
    console.log(req.body.content);
  } catch (err) {
    res.redirect("/");
  }
});

//UPDATE
app
  .route("/edit/:id")
  .get((req, res) => {
    const id = req.params.id;
    TodoTask.find({}, (err, tasks) => {
      res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
    });
  })
  .post((req, res) => {
    const id = req.params.id;
    TodoTask.findByIdAndUpdate(id, { content: req.body.content }, (err) => {
      if (err) return res.send(500, err);
      res.redirect("/");
    });
  });

//DELETE
app.route("/remove/:id").get((req, res) => {
  const id = req.params.id;
  TodoTask.findByIdAndRemove(id, (err) => {
    if (err) return res.send(500, err);
    res.redirect("/");
  });
});

//DELETE ALL
app.route("/removeAll").get((req, res) => {
  TodoTask.deleteMany({}, (err) => {
    if (err) return res.send(500, err);
    res.redirect("/");
  });
});
