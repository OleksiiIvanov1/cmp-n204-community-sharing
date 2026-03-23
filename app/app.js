require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

app.use(express.static("static"));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

const db = require("../services/db");

app.get("/", function(req, res) {
    res.redirect("/skills");
});

app.get("/db_test", function(req, res) {
    const sql = 'select * from test_table';
    db.query(sql).then(results => {
        res.send(results);
    });
});

app.get("/skills", (req, res) => {
    const skills = [
        { id: 1, title: "Spanish Conversation", description: "Native speaker offering weekly sessions. Beginners welcome.", category: "Language", level: "Beginner friendly", teacher: "Maria G." },
        { id: 2, title: "Python for Beginners", description: "Learn Python from scratch. No coding experience needed.", category: "Technology", level: "All levels", teacher: "James T." },
        { id: 3, title: "French for Travellers", description: "Practical French for restaurants, transport and sightseeing.", category: "Language", level: "Intermediate", teacher: "Sophie L." },
        { id: 4, title: "Guitar — Jazz Basics", description: "Jazz chord voicings and swing rhythm on acoustic or electric.", category: "Music", level: "Intermediate", teacher: "Alex R." },
        { id: 5, title: "Mandarin Chinese", description: "HSK 1-3 prep and daily conversation with a native Beijing speaker.", category: "Language", level: "Beginner friendly", teacher: "Li W." },
        { id: 6, title: "Watercolour Painting", description: "Explore watercolour from washes to fine detail work.", category: "Art & Design", level: "All levels", teacher: "Priya K." }
    ];
    res.render("listings", { skills });
});

app.get("/skills/:id", (req, res) => {
    const skill = {
        id: req.params.id,
        title: "Spanish Conversation Practice",
        description: "Native speaker offering weekly conversation sessions focused on everyday vocabulary and natural speaking flow. Sessions are relaxed and informal — great for building confidence.",
        category: "Language",
        level: "Beginner friendly",
        teacher: "Maria G.",
        location: "Online or London",
        availability: "Weekends preferred",
        wantedSkill: "English conversation",
        wantedSkill2: "Music lessons"
    };
    res.render("detail", { skill });
});

app.get("/users", (req, res) => {
    const users = [
        { id: 1, name: "Maria Garcia", bio: "Spanish tutor · London", skillCount: 3 },
        { id: 2, name: "James Thompson", bio: "Software developer · Manchester", skillCount: 2 },
        { id: 3, name: "Sophie Laurent", bio: "French teacher · Edinburgh", skillCount: 4 },
        { id: 4, name: "Li Wei", bio: "Mandarin tutor · Birmingham", skillCount: 2 },
        { id: 5, name: "Alex Rivera", bio: "Musician · Bristol", skillCount: 3 },
        { id: 6, name: "Priya Kapoor", bio: "Artist · Leeds", skillCount: 2 }
    ];
    res.render("users", { users });
});

app.get("/users/:id", (req, res) => {
    const user = {
        id: req.params.id,
        name: "Maria Garcia",
        email: "maria.garcia@email.com"
    };
    const skills = [
        { id: 1, title: "Spanish Conversation", description: "Native speaker, beginner friendly weekly sessions", category: "Language", level: "Beginner" },
        { id: 2, title: "Spanish Writing", description: "Grammar, composition and essay feedback", category: "Language", level: "Intermediate" },
        { id: 3, title: "Salsa Dancing", description: "Cuban-style salsa basics for absolute beginners", category: "Dance", level: "Beginner" }
    ];
    res.render("profile", { user, skills });
});

app.listen(3000, function() {
    console.log(`Server running at http://127.0.0.1:3000/`);
});

module.exports = app;