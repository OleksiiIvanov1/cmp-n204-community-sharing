require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("static"));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

const db = require("../services/db");


// ======================
// HOME
// ======================
app.get("/", (req, res) => {
    res.redirect("/skills");
});


// ======================
// DB TEST — proves the database connection works
// ======================
app.get("/db_test", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM users");
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// LIST ALL SKILLS
// Joins skills with users (to get the offerer's name)
// and categories (to get the category name).
// ======================
app.get("/skills", async (req, res) => {
    try {
        const rows = await db.query(`
            SELECT
                skills.id,
                skills.title,
                skills.description,
                users.name AS teacher,
                categories.name AS category
            FROM skills
            JOIN users ON skills.user_id = users.id
            JOIN categories ON skills.category_id = categories.id
        `);

        // Add a default level so the Pug template renders cleanly.
        const skills = rows.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            teacher: s.teacher,
            category: s.category,
            level: "All levels"
        }));

        res.render("listings", { skills });
    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// VIEW ONE SKILL IN DETAIL
// ======================
app.get("/skills/:id", async (req, res) => {
    try {
        const rows = await db.query(`
            SELECT
                skills.id,
                skills.title,
                skills.description,
                users.name AS teacher,
                categories.name AS category
            FROM skills
            JOIN users ON skills.user_id = users.id
            JOIN categories ON skills.category_id = categories.id
            WHERE skills.id = ?
        `, [req.params.id]);

        if (!rows.length) {
            return res.status(404).send("Skill not found");
        }

        const skill = {
            id: rows[0].id,
            title: rows[0].title,
            description: rows[0].description,
            category: rows[0].category,
            level: "All levels",
            teacher: rows[0].teacher
        };

        res.render("detail", { skill });
    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// LIST ALL USERS
// ======================
app.get("/users", async (req, res) => {
    try {
        const rows = await db.query("SELECT id, name, email FROM users");

        const users = rows.map(u => ({
            id: u.id,
            name: u.name,
            bio: u.email,
            skillCount: 0
        }));

        res.render("users", { users });
    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// VIEW ONE USER PROFILE + the skills they offer
// ======================
app.get("/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        const userRows = await db.query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [userId]
        );

        if (!userRows.length) {
            return res.status(404).send("User not found");
        }

        const skillRows = await db.query(`
            SELECT
                skills.id,
                skills.title,
                skills.description,
                categories.name AS category
            FROM skills
            JOIN categories ON skills.category_id = categories.id
            WHERE skills.user_id = ?
        `, [userId]);

        const user = {
            id: userRows[0].id,
            name: userRows[0].name,
            email: userRows[0].email
        };

        const skills = skillRows.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            category: s.category,
            level: "All levels"
        }));

        res.render("profile", { user, skills });
    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// SERVER
// ======================
app.listen(3000, () => {
    console.log("Server running at http://127.0.0.1:3000/");
});

module.exports = app;
