"use strict";

const express = require("express");
const app = express();

// Basic test route
app.get("/", (req, res) => {
    res.send("Community Share - Sprint 1 setup working");
});

module.exports = app;
