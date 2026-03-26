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
// DB TEST
// ======================
app.get("/db_test", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM Students");
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// SKILLS (MODULES)
// ======================
app.get("/skills", async (req, res) => {
    try {
        const modules = await db.query("SELECT * FROM Modules");

        // map DB → PUG EXPECTED FORMAT
        const skills = modules.map(m => ({
            id: m.module_id,
            title: m.module_name,
            description: "Module available for study",
            category: "Module",
            level: "All levels",
            teacher: "Staff"
        }));

        res.render("listings", { skills });
    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// SINGLE SKILL (MODULE)
// ======================
app.get("/skills/:id", async (req, res) => {
    try {
        const module = await db.query(
            "SELECT * FROM Modules WHERE module_id = ?",
            [req.params.id]
        );

        if (!module.length) {
            return res.status(404).send("Module not found");
        }

        const skill = {
            id: module[0].module_id,
            title: module[0].module_name,
            description: "This module is part of the course offering.",
            category: "Module",
            level: "All levels",
            teacher: "Staff",
            location: "University",
            availability: "Semester-based",
            wantedSkill: "Collaboration",
            wantedSkill2: "Teamwork"
        };

        res.render("detail", { skill });

    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// USERS (STUDENTS)
// ======================
app.get("/users", async (req, res) => {
    try {
        const students = await db.query("SELECT * FROM Students");

        // map to PUG format
        const users = students.map(s => ({
            id: s.student_id,
            name: s.name,
            bio: "Student",
            skillCount: 0 // optional
        }));

        res.render("users", { users });
    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// SINGLE USER + MODULES
// ======================
app.get("/users/:id", async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await db.query(
            "SELECT * FROM Students WHERE student_id = ?",
            [studentId]
        );

        if (!student.length) {
            return res.status(404).send("Student not found");
        }

        const modules = await db.query(`
            SELECT 
                Modules.module_id AS id,
                Modules.module_name AS title,
                'Module description' AS description,
                'Module' AS category,
                'All levels' AS level
            FROM Enrollments
            JOIN Modules ON Enrollments.module_id = Modules.module_id
            WHERE Enrollments.student_id = ?
        `, [studentId]);

        const user = {
            id: student[0].student_id,
            name: student[0].name,
            email: student[0].email
        };

        res.render("profile", {
            user,
            skills: modules
        });

    } catch (err) {
        res.status(500).send(err);
    }
});


// ======================
// CREATE STUDENT
// ======================
app.post("/students", async (req, res) => {
    try {
        const { name, email } = req.body;

        await db.query(
            "INSERT INTO Students (name, email) VALUES (?, ?)",
            [name, email]
        );

        res.redirect("/users");
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