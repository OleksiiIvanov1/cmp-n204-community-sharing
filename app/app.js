require("dotenv").config();

const express = require("express");
const app = express();

const db = require("../services/db");

// allow form data
app.use(express.urlencoded({ extended: true }));

// ================= HOME =================
app.get("/", (req, res) => {
  res.send("Home working");
});


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
      <head><title>Users</title></head>
      <body>
        <h1>Users List</h1>
        <ul>
    `;

    users.forEach((user) => {
      html += `<li><a href="/users/${user.id}">${user.name} - ${user.email}</a></li>`;
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

    if (rows.length === 0) return res.send("User not found");

    const user = rows[0];

    let html = `
      <html>
      <body>
        <h1>User Profile</h1>
        <p>ID: ${user.id}</p>
        <p>Name: ${user.name}</p>
        <p>Email: ${user.email}</p>
        <a href="/users">Back</a>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load profile");
  }
});


// ================= SKILLS LIST =================
app.get("/skills", async (req, res) => {
  try {
    const skills = await db.query("SELECT * FROM skills");

    let html = `
      <html>
      <body>
        <h1>Skills List</h1>
        <a href="/skills/create">Create New Skill</a>
        <ul>
    `;

    skills.forEach((skill) => {
      html += `<li>
        <a href="/skills/${skill.id}">
          ${skill.title} - ${skill.category}
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
    res.status(500).send("Failed to load skills");
  }
});


// ================= ⭐ CREATE SKILL FORM =================
app.get("/skills/create", (req, res) => {
  res.send(`
    <html>
    <body>
      <h1>Create Skill</h1>

      <form method="POST" action="/skills/create">
        <input name="title" placeholder="Title" required/><br/><br/>
        <input name="category" placeholder="Category" required/><br/><br/>
        <textarea name="description" placeholder="Description"></textarea><br/><br/>

        <button type="submit">Create</button>
      </form>

      <br/>
      <a href="/skills">Back</a>
    </body>
    </html>
  `);
});


// ================= ⭐ HANDLE CREATE SKILL =================
app.post("/skills/create", async (req, res) => {
  try {
    const { title, category, description } = req.body;

    await db.query(
      "INSERT INTO skills (title, category, description) VALUES (?, ?, ?)",
      [title, category, description]
    );

    res.redirect("/skills");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to create skill");
  }
});


// ================= SINGLE SKILL =================
app.get("/skills/:id", async (req, res) => {
  try {
    const rows = await db.query(
      "SELECT * FROM skills WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) return res.send("Skill not found");

    const skill = rows[0];

    let html = `
      <html>
      <body>
        <h1>Skill Detail</h1>
        <p>ID: ${skill.id}</p>
        <p>Title: ${skill.title}</p>
        <p>Category: ${skill.category}</p>
        <p>Description: ${skill.description}</p>

        <a href="/skills">Back</a>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load skill");
  }
});


// ================= SERVER =================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports = app;