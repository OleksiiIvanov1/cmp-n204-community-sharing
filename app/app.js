require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

// static
app.use(express.static("static"));

// view engine (if required)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));

// DB
const db = require("../services/db");

// routes
app.get("/", (req, res) => {
    res.send("Home working");
});

// DB test (KEEP THIS — teacher expects it)
app.get("/db_test", async (req, res) => {
    const results = await db.query("SELECT * FROM test_table");
    res.send(results);
});

// skills
app.get("/skills", (req, res) => {
    const skills = [
        { id: 1, title: "JavaScript" },
        { id: 2, title: "English" }
    ];

    res.render("listings", { skills });
});

// single skill
app.get("/skills/:id", (req, res) => {
    const skill = {
        id: req.params.id,
        title: "JavaScript",
        description: "Example skill"
    };

    res.render("detail", { skill });
});

// users
app.get("/users", (req, res) => {
    const users = [
        { id: 1, name: "Alex" },
        { id: 2, name: "John" }
    ];

    res.render("users", { users });
});

// user profile
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

// IMPORTANT: start server HERE (not index.js)
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

module.exports = app;