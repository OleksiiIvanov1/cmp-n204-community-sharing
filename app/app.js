"use strict";

const express = require("express");
const path = require("path");

const app = express();

// PUG setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));



// Home
app.get("/", (req, res) => {
    res.send("Home working");
});

// Test
app.get("/test", (req, res) => {
    res.render("layout");
});


// SKILLS


// Skills list
app.get("/skills", (req, res) => {
    const skills = [
        { id: 1, title: "JavaScript" },
        { id: 2, title: "English" }
    ];

    res.render("listings", { skills });
});

// Skill detail
app.get("/skills/:id", (req, res) => {
    const skill = {
        id: req.params.id,
        title: "JavaScript",
        description: "Learn JS basics"
    };

    res.render("detail", { skill });
});



// USERS

// Users list
app.get("/users", (req, res) => {
    const users = [
        { id: 1, name: "Alex" },
        { id: 2, name: "John" }
    ];

    res.render("users", { users });
});

// User profile
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



// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});