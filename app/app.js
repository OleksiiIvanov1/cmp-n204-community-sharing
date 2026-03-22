require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

app.use(express.static("static"));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

const db = require("../services/db");

app.get("/", function(req, res) {
    res.send("Hello world!");
});

app.get("/db_test", function(req, res) {
    const sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results);
    });
});

app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

app.get("/hello/:name", function(req, res) {
    console.log(req.params);
    res.send("Hello " + req.params.name);
});

app.get("/skills", (req, res) => {
    const skills = [
        { id: 1, title: "JavaScript" },
        { id: 2, title: "English" }
    ];
    res.render("listings", { skills });
});

app.get("/skills/:id", (req, res) => {
    const skill = {
        id: req.params.id,
        title: "JavaScript",
        description: "Example skill"
    };
    res.render("detail", { skill });
});

app.get("/users", (req, res) => {
    const users = [
        { id: 1, name: "Alex" },
        { id: 2, name: "John" }
    ];
    res.render("users", { users });
});

app.get("/users/:id", (req, res) => {
    const user = {
        id: req.params.id,
        name: "Alex",
        email: "alex@email.com"
    };
    const skills = [
        { title: "JavaScript" },
        { title: "English" }
    ];
    res.render("profile", { user, skills });
});

app.listen(3000, function() {
    console.log(`Server running at http://127.0.0.1:3000/`);
});

module.exports = app;