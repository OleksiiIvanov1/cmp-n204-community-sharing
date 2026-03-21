require("dotenv").config();

const express = require("express");
<<<<<<< HEAD
const app = express();

// DB
const db = require("../services/db");

// ================= HOME =================
=======
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
>>>>>>> 7f3833a31934e5e88b8d237aef3d2a9e266a92d3
app.get("/", (req, res) => {
    res.send("Home working");
});

<<<<<<< HEAD
// ================= DB TEST =================
app.get("/db_test", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM users");
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database query failed");
    }
});

// ================= USERS LIST =================
app.get("/users", async (req, res) => {
    try {
        const users = await db.query("SELECT * FROM users");

        let html = `
        <html>
        <head>
            <title>Users</title>
        </head>
        <body>
            <h1>Users List</h1>
            <ul>
        `;

        users.forEach(user => {
            html += `<li>
                        <a href="/users/${user.id}">
                            ${user.name} - ${user.email}
                        </a>
                    </li>`;
        });

        html += `
            </ul>
        </body>
        </html>
        `;

        res.send(html);

    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to load users");
    }
});

// ================= USER PROFILE =================
app.get("/users/:id", async (req, res) => {
    try {
        const rows = await db.query(
            "SELECT * FROM users WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.send("User not found");
        }

        const user = rows[0];

        let html = `
        <html>
        <head>
            <title>User Profile</title>
        </head>
        <body>
            <h1>User Profile</h1>

            <p>ID: ${user.id}</p>
            <p>Name: ${user.name}</p>
            <p>Email: ${user.email}</p>

            <a href="/users">Back to users</a>
        </body>
        </html>
        `;

        res.send(html);

    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to load profile");
    }
});

// ================= SERVER =================
=======
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
>>>>>>> 7f3833a31934e5e88b8d237aef3d2a9e266a92d3
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

module.exports = app;