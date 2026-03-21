require("dotenv").config();

const express = require("express");
const app = express();

const db = require("../services/db");

// Home
app.get("/", (req, res) => {
  res.send("Home working");
});

// DB test
app.get("/db_test", async (req, res) => {
  try {
    const results = await db.query("SELECT * FROM users");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database query failed");
  }
});

// Users list
app.get("/users", async (req, res) => {
  try {
    const users = await db.query("SELECT * FROM users");

    let html = "<h1>Users List</h1><ul>";

    users.forEach((user) => {
      html += `<li><a href="/users/${user.id}">${user.name} - ${user.email}</a></li>`;
    });

    html += "</ul>";
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load users");
  }
});

// Single user
app.get("/users/:id", async (req, res) => {
  try {
    const rows = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);

    if (rows.length === 0) {
      return res.send("User not found");
    }

    const user = rows[0];

    let html = `
      <h1>User Profile</h1>
      <p>ID: ${user.id}</p>
      <p>Name: ${user.name}</p>
      <p>Email: ${user.email}</p>
      <a href="/users">Back</a>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load profile");
  }
});

// Skills list
app.get("/skills", async (req, res) => {
  try {
    const skills = await db.query("SELECT * FROM skills");

    let html = "<h1>Skills List</h1><ul>";

    skills.forEach((skill) => {
      html += `<li><a href="/skills/${skill.id}">${skill.title} - ${skill.category}</a></li>`;
    });

    html += "</ul>";
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load skills");
  }
});

// Single skill
app.get("/skills/:id", async (req, res) => {
  try {
    const rows = await db.query("SELECT * FROM skills WHERE id = ?", [req.params.id]);

    if (rows.length === 0) {
      return res.send("Skill not found");
    }

    const skill = rows[0];

    let html = `
      <h1>Skill Detail</h1>
      <p>ID: ${skill.id}</p>
      <p>Title: ${skill.title}</p>
      <p>Description: ${skill.description}</p>
      <p>Category: ${skill.category}</p>
      <a href="/skills">Back</a>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load skill");
  }
});

// Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

