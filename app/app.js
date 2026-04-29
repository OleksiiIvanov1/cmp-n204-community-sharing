require("dotenv").config();

const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware — keeps users logged in across requests
app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Make the logged-in user available to all Pug views as `currentUser`
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

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
        const results = await db.query("SELECT id, name, email FROM users");
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// LIST ALL SKILLS
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
// ======================
// REGISTER — show form
// ======================
app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// ======================
// LOGIN — show form
// ======================
app.get("/login", (req, res) => {
    res.render("login", { error: null });
});


// ======================
// LOGIN — handle form submission
// ======================
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render("login", { error: "Email and password are required." });
        }

        // Find the user
        const rows = await db.query(
            "SELECT id, name, email, password_hash FROM users WHERE email = ?",
            [email]
        );

        if (!rows.length) {
            // Same message whether email or password is wrong (security best practice)
            return res.render("login", { error: "Invalid email or password." });
        }

        // Compare the entered password to the stored hash
        const match = await bcrypt.compare(password, rows[0].password_hash);
        if (!match) {
            return res.render("login", { error: "Invalid email or password." });
        }

        // Set the session
        req.session.user = {
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email
        };

        res.redirect("/skills");
    } catch (err) {
        console.error(err);
        res.render("login", { error: "Something went wrong. Please try again." });
    }
});


// ======================
// LOGOUT — destroy the session
// ======================
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});
// ======================
// REGISTER — handle form submission
// ======================
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.render("register", { error: "All fields are required." });
        }
        if (password.length < 8) {
            return res.render("register", { error: "Password must be at least 8 characters." });
        }

        // Check if email is already taken
        const existing = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length) {
            return res.render("register", { error: "An account with that email already exists." });
        }

        // Hash the password before storing
        const password_hash = await bcrypt.hash(password, 10);

        // Insert the new user
        const result = await db.query(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            [name, email, password_hash]
        );

        // Log them in immediately by setting the session
        req.session.user = { id: result.insertId, name, email };

        res.redirect("/skills");
    } catch (err) {
        console.error(err);
        res.render("register", { error: "Something went wrong. Please try again." });
    }
});