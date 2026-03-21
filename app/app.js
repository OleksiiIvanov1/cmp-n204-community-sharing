require("dotenv").config();

const express = require("express");
const app = express();

const db = require("../services/db");

app.get("/", (req, res) => {
  res.send("Home working");
});

app.get("/db_test", async (req, res) => {
  try {
    const results = await db.query("SELECT * FROM users");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database query failed");
  }
});

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

app.get("/users/:id", async (req, res) => {
  try {
    const rows = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);

    if (rows.length === 0) {
      return res.send("User not found");
    }

    const user = rows[0];

    let html = `
      <html>
      <head><title>User Profile</title></head>
      <body>
        <h1>User Profile</h1>
        <p>ID: ${user.id}</p>
        <p>Name: ${user.name}</p>
        <p>Email: ${user.email}</p>
        <p><a href="/users">Back to users</a></p>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load profile");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports = app;