require("dotenv").config();
const { sendMail } = require("./mailer");
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
// LIST ALL SKILLS (with optional category filter)
// ======================
app.get("/skills", async (req, res) => {
    try {
        const selectedCategory = req.query.cat || null;

        // Build the query dynamically depending on whether a filter is applied
        let sql = `
            SELECT
                skills.id,
                skills.title,
                skills.description,
                users.name AS teacher,
                categories.name AS category
            FROM skills
            JOIN users ON skills.user_id = users.id
            JOIN categories ON skills.category_id = categories.id
        `;
        const params = [];

        if (selectedCategory) {
            sql += " WHERE categories.name = ?";
            params.push(selectedCategory);
        }

        const rows = await db.query(sql, params);

        const skills = rows.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            teacher: s.teacher,
            category: s.category,
            level: "All levels"
        }));

        // Get all categories so we can render the filter badges
        const categoryRows = await db.query("SELECT name FROM categories ORDER BY name");
        const categories = categoryRows.map(c => c.name);

        res.render("listings", { skills, categories, selectedCategory });
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

       res.render("detail", {
            skill,
            requested: req.query.requested === "1",
            already: req.query.already === "1"
        });
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

       res.render("profile", { user, skills, isOwnProfile: req.session.user && req.session.user.id === parseInt(req.params.id) });
    } catch (err) {
        res.status(500).send(err);
    }
});
// ======================
// REQUEST a skill (must be logged in)
// ======================
app.post("/skills/:id/request", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const skillId = req.params.id;
        const requesterId = req.session.user.id;
        const requesterName = req.session.user.name;

        // Check the skill exists and isn't the user's own skill
        const skillRows = await db.query(
            "SELECT id, user_id, title FROM skills WHERE id = ?",
            [skillId]
        );

        if (!skillRows.length) {
            return res.status(404).send("Skill not found");
        }

        if (skillRows[0].user_id === requesterId) {
            return res.status(400).send("You can't request your own skill.");
        }

        // Prevent duplicate pending requests
        const existing = await db.query(
            "SELECT id FROM requests WHERE skill_id = ? AND requester_id = ? AND status = 'Pending'",
            [skillId, requesterId]
        );

        if (existing.length) {
            return res.redirect(`/skills/${skillId}?already=1`);
        }

        await db.query(
            "INSERT INTO requests (skill_id, requester_id) VALUES (?, ?)",
            [skillId, requesterId]
        );

        // Notify the skill owner by email (non-blocking)
        const ownerRows = await db.query(
            "SELECT name, email FROM users WHERE id = ?",
            [skillRows[0].user_id]
        );
        if (ownerRows.length) {
            sendMail({
                to: ownerRows[0].email,
                subject: `New exchange request for "${skillRows[0].title}"`,
                text: `Hi ${ownerRows[0].name},\n\n${requesterName} has requested to exchange your skill "${skillRows[0].title}" on Community Share.\n\nLog in to view and respond: http://localhost:3000/requests\n\n— Community Share`
            });
        }

        res.redirect(`/skills/${skillId}?requested=1`);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});
// ======================
// VIEW MY REQUESTS (incoming + outgoing)
// ======================
app.post("/requests/:id/accept", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const requestId = req.params.id;
        const userId = req.session.user.id;
        const ownerName = req.session.user.name;

        // Verify the logged-in user owns the skill, and grab info for the email
        const ownerCheck = await db.query(`
            SELECT
                skills.user_id,
                skills.title AS skill_title,
                requester.email AS requester_email,
                requester.name AS requester_name
            FROM requests
            JOIN skills ON requests.skill_id = skills.id
            JOIN users AS requester ON requests.requester_id = requester.id
            WHERE requests.id = ?
        `, [requestId]);

        if (!ownerCheck.length || ownerCheck[0].user_id !== userId) {
            return res.status(403).send("Not allowed");
        }

        await db.query(
            "UPDATE requests SET status = 'Accepted' WHERE id = ?",
            [requestId]
        );

        // Notify the requester
        sendMail({
            to: ownerCheck[0].requester_email,
            subject: `Your request for "${ownerCheck[0].skill_title}" was accepted`,
            text: `Hi ${ownerCheck[0].requester_name},\n\n${ownerName} accepted your exchange request for "${ownerCheck[0].skill_title}".\n\nLog in to see your requests: http://localhost:3000/requests\n\n— Community Share`
        });

        res.redirect("/requests?updated=1");
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});
// ======================
// ACCEPT a request (only the skill owner can)
// ======================
app.post("/requests/:id/reject", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const requestId = req.params.id;
        const userId = req.session.user.id;
        const ownerName = req.session.user.name;

        const ownerCheck = await db.query(`
            SELECT
                skills.user_id,
                skills.title AS skill_title,
                requester.email AS requester_email,
                requester.name AS requester_name
            FROM requests
            JOIN skills ON requests.skill_id = skills.id
            JOIN users AS requester ON requests.requester_id = requester.id
            WHERE requests.id = ?
        `, [requestId]);

        if (!ownerCheck.length || ownerCheck[0].user_id !== userId) {
            return res.status(403).send("Not allowed");
        }

        await db.query(
            "UPDATE requests SET status = 'Rejected' WHERE id = ?",
            [requestId]
        );

        // Notify the requester
        sendMail({
            to: ownerCheck[0].requester_email,
            subject: `Your request for "${ownerCheck[0].skill_title}" was declined`,
            text: `Hi ${ownerCheck[0].requester_name},\n\n${ownerName} declined your exchange request for "${ownerCheck[0].skill_title}". Don't worry — there are plenty of other skills on Community Share.\n\nLog in to browse: http://localhost:3000/skills\n\n— Community Share`
        });

        res.redirect("/requests?updated=1");
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

// ======================
// REJECT a request (only the skill owner can)
// ======================
app.post("/requests/:id/reject", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const requestId = req.params.id;
        const userId = req.session.user.id;

        const ownerCheck = await db.query(`
            SELECT skills.user_id
            FROM requests
            JOIN skills ON requests.skill_id = skills.id
            WHERE requests.id = ?
        `, [requestId]);

        if (!ownerCheck.length || ownerCheck[0].user_id !== userId) {
            return res.status(403).send("Not allowed");
        }

        await db.query(
            "UPDATE requests SET status = 'Rejected' WHERE id = ?",
            [requestId]
        );

        res.redirect("/requests?updated=1");
    } catch (err) {
        console.error(err);
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
// ======================
// MY PROFILE — redirect to my own /users/:id page
// ======================
app.get("/profile", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.redirect("/users/" + req.session.user.id);
});

// ======================
// EDIT MY PROFILE — show form
// ======================
app.get("/profile/edit", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }
        const rows = await db.query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [req.session.user.id]
        );
        if (!rows.length) {
            return res.redirect("/login");
        }
        res.render("profile-edit", { user: rows[0], error: null, success: null });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

// ======================
// EDIT MY PROFILE — handle submission
// ======================
app.post("/profile/edit", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const userId = req.session.user.id;
        const { name, email, password } = req.body;

        const renderError = async (msg) => {
            const rows = await db.query("SELECT id, name, email FROM users WHERE id = ?", [userId]);
            return res.render("profile-edit", { user: rows[0], error: msg, success: null });
        };

        if (!name || !email) {
            return renderError("Name and email are required.");
        }

        if (password && password.length > 0 && password.length < 8) {
            return renderError("Password must be at least 8 characters (or leave blank to keep current).");
        }

        // Check if email is taken by another account
        const existing = await db.query(
            "SELECT id FROM users WHERE email = ? AND id != ?",
            [email, userId]
        );
        if (existing.length) {
            return renderError("That email is already in use by another account.");
        }

        // Update name and email
        await db.query(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name, email, userId]
        );

        // Update password if provided
        if (password && password.length >= 8) {
            const password_hash = await bcrypt.hash(password, 10);
            await db.query(
                "UPDATE users SET password_hash = ? WHERE id = ?",
                [password_hash, userId]
            );
        }

        // Update session so nav reflects new name/email immediately
        req.session.user.name = name;
        req.session.user.email = email;

        const updated = await db.query("SELECT id, name, email FROM users WHERE id = ?", [userId]);
        res.render("profile-edit", {
            user: updated[0],
            error: null,
            success: "Profile updated successfully."
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});
// ======================
// VIEW MY REQUESTS (incoming + outgoing)
// ======================
app.get("/requests", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const userId = req.session.user.id;

        // Incoming: requests for skills I own
        const incoming = await db.query(`
            SELECT
                requests.id,
                requests.status,
                requests.created_at,
                skills.title AS skill_title,
                users.name AS requester_name
            FROM requests
            JOIN skills ON requests.skill_id = skills.id
            JOIN users ON requests.requester_id = users.id
            WHERE skills.user_id = ?
            ORDER BY requests.created_at DESC
        `, [userId]);

        // Outgoing: requests I made
        const outgoing = await db.query(`
            SELECT
                requests.id,
                requests.status,
                requests.created_at,
                skills.id AS skill_id,
                skills.title AS skill_title,
                users.name AS owner_name
            FROM requests
            JOIN skills ON requests.skill_id = skills.id
            JOIN users ON skills.user_id = users.id
            WHERE requests.requester_id = ?
            ORDER BY requests.created_at DESC
        `, [userId]);

        res.render("requests", {
            incoming,
            outgoing,
            updated: req.query.updated === "1"
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});
// ======================
// MESSAGES — view conversation with a specific user
// ======================
app.get("/messages/:userId", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const myId = req.session.user.id;
        const otherId = parseInt(req.params.userId);

        if (isNaN(otherId) || otherId === myId) {
            return res.status(400).send("Invalid user");
        }

        // Get the other user's info
        const otherRows = await db.query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [otherId]
        );
        if (!otherRows.length) {
            return res.status(404).send("User not found");
        }

        // Get all messages between us, oldest first
        const messages = await db.query(`
            SELECT id, sender_id, recipient_id, body, created_at
            FROM messages
            WHERE (sender_id = ? AND recipient_id = ?)
               OR (sender_id = ? AND recipient_id = ?)
            ORDER BY created_at ASC
        `, [myId, otherId, otherId, myId]);

        // Mark messages from the other user as read
        await db.query(`
            UPDATE messages SET read_at = NOW()
            WHERE recipient_id = ? AND sender_id = ? AND read_at IS NULL
        `, [myId, otherId]);

        res.render("conversation", {
            otherUser: otherRows[0],
            messages,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

// ======================
// MESSAGES — send a new message
// ======================
app.post("/messages/:userId", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const myId = req.session.user.id;
        const otherId = parseInt(req.params.userId);
        const { body } = req.body;

        if (isNaN(otherId) || otherId === myId) {
            return res.status(400).send("Invalid recipient");
        }
        if (!body || !body.trim()) {
            return res.redirect(`/messages/${otherId}`);
        }

        // Verify recipient exists
        const recipientRows = await db.query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [otherId]
        );
        if (!recipientRows.length) {
            return res.status(404).send("Recipient not found");
        }

        // Insert the message
        await db.query(
            "INSERT INTO messages (sender_id, recipient_id, body) VALUES (?, ?, ?)",
            [myId, otherId, body.trim()]
        );

        res.redirect(`/messages/${otherId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});