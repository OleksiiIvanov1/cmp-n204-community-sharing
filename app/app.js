require("dotenv").config();
console.log("DB USER:", process.env.DB_USER);

const express = require("express");
const app = express();
const db = require("../services/db");

app.use(express.urlencoded({ extended: true }));

// ================= HELPERS =================
async function getPK(table) {
  const cols = await db.query(`SHOW COLUMNS FROM ${table}`);
  return cols.find(c => c.Key === "PRI")?.Field || cols[0].Field;
}

async function getCols(table) {
  const cols = await db.query(`SHOW COLUMNS FROM ${table}`);
  return cols.map(c => c.Field);
}

function pick(obj, keys, def="") {
  for (let k of keys) if (obj[k] !== undefined) return obj[k];
  return def;
}

// ================= LAYOUT =================
function layout(title, body) {
  return `
  <html>
  <head>
    <title>${title}</title>
    <style>
      body { font-family: Arial; background:#F3F4F6; margin:0; }
      .nav { background:#2563EB; padding:15px 30px; display:flex; gap:20px; }
      .nav a { color:white; text-decoration:none; }
      .container { max-width:1100px; margin:auto; padding:30px; }

      .hero {
        background: linear-gradient(135deg,#2563EB,#60A5FA);
        color:white;
        padding:50px;
        border-radius:18px;
        margin-bottom:30px;
      }

      .btn {
        padding:10px 15px;
        border-radius:8px;
        text-decoration:none;
        margin-right:10px;
      }

      .btn-primary { background:#22C55E; color:white; }
      .btn-secondary { background:white; color:#2563EB; }

      .grid {
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
        gap:20px;
      }

      .card {
        background:white;
        padding:20px;
        border-radius:12px;
        margin-bottom:15px;
      }
    </style>
  </head>
  <body>

    <div class="nav">
      <a href="/">Home</a>
      <a href="/users">Members</a>
      <a href="/skills">Skills</a>
      <a href="/requests">Requests</a>
      <a href="/categories">Categories</a>
    </div>

    <div class="container">
      ${body}
    </div>

  </body>
  </html>
  `;
}

// ================= HOME =================
app.get("/", (req,res)=>{
  res.send(layout("Home",`

    <div class="hero">
      <h1>Learn Together. Share Together.</h1>
      <p>
        Community Share is a student skill exchange platform where users can
        offer skills, ask for help, and build useful connections in a simple
        and supportive space.
      </p>

      <a class="btn btn-primary" href="/skills">Browse Skills</a>
      <a class="btn btn-secondary" href="/users">View Members</a>
    </div>

    <h2>What you can do</h2>

    <div class="grid">
      <div class="card">
        <h3>Explore Skills</h3>
        <p>Browse useful skills shared by students.</p>
      </div>

      <div class="card">
        <h3>Connect with Members</h3>
        <p>View profiles and find people who can help.</p>
      </div>

      <div class="card">
        <h3>Send Requests</h3>
        <p>Request help directly from skill pages.</p>
      </div>
    </div>

    <h2>Our Team</h2>

    <div class="grid">
      <div class="card"><h3>Mehedi</h3><p>Database + backend support.</p></div>
      <div class="card"><h3>Abbas</h3><p>Documentation + planning.</p></div>
      <div class="card"><h3>Shannel</h3><p>Testing + UI improvements.</p></div>
      <div class="card"><h3>Oleksii</h3><p>Research + system ideas.</p></div>
    </div>

  `));
});

// ================= USERS =================
app.get("/users", async (req,res)=>{
  const users = await db.query("SELECT * FROM users");
  const pk = await getPK("users");

  let html="<h1>Members</h1>";

  users.forEach(u=>{
    html+=`
      <div class="card">
        <h3>${pick(u,["name"])}</h3>
        <p>${pick(u,["email"])}</p>
        <a class="btn btn-primary" href="/users/${u[pk]}">View</a>
      </div>
    `;
  });

  res.send(layout("Users",html));
});

// ================= SKILLS =================
app.get("/skills", async (req,res)=>{
  const skills = await db.query("SELECT * FROM skills");
  const pk = await getPK("skills");

  let html="<h1>Skills</h1><a class='btn btn-primary' href='/skills/create'>Create</a>";

  skills.forEach(s=>{
    html+=`
      <div class="card">
        <h3>${pick(s,["title"])}</h3>
        <p>${pick(s,["description"])}</p>
        <a class="btn btn-primary" href="/skills/${s[pk]}">View</a>
      </div>
    `;
  });

  res.send(layout("Skills",html));
});

app.get("/skills/create",(req,res)=>{
  res.send(layout("Create",`
    <h1>Create Skill</h1>
    <form method="POST">
      <input name="title" placeholder="Title"/><br><br>
      <textarea name="description"></textarea><br>
      <button>Create</button>
    </form>
  `));
});

app.post("/skills/create", async (req,res)=>{
  await db.query(
    "INSERT INTO skills (title, description) VALUES (?,?)",
    [req.body.title, req.body.description]
  );
  res.redirect("/skills");
});

// ================= SKILL DETAIL =================
app.get("/skills/:id", async (req,res)=>{
  const skill = await db.query("SELECT * FROM skills WHERE id=?", [req.params.id]);

  res.send(layout("Skill",`
    <div class="card">
      <h2>${skill[0].title}</h2>
      <p>${skill[0].description}</p>
      <a class="btn btn-primary" href="/skills/${req.params.id}/request">Request</a>
    </div>
  `));
});

// ================= REQUEST =================
app.get("/skills/:id/request",(req,res)=>{
  res.send(layout("Request",`
    <h1>Request Skill</h1>
    <form method="POST">
      <textarea name="message"></textarea><br>
      <button>Send</button>
    </form>
  `));
});

app.post("/skills/:id/request", async (req,res)=>{
  await db.query(
    "INSERT INTO requests (skill_id, message, status) VALUES (?,?,?)",
    [req.params.id, req.body.message, "Pending"]
  );

  res.redirect("/requests");
});

// ================= REQUESTS =================
app.get("/requests", async (req,res)=>{
  const r = await db.query("SELECT * FROM requests");

  let html="<h1>Requests</h1>";

  r.forEach(x=>{
    html+=`
      <div class="card">
        <p>${x.message}</p>
        <p>Status: ${x.status}</p>
      </div>
    `;
  });

  res.send(layout("Requests",html));
});

// ================= CATEGORIES =================
app.get("/categories", async (req,res)=>{
  const c = await db.query("SELECT * FROM categories");

  let html="<h1>Categories</h1>";

  c.forEach(x=>{
    html+=`<div class="card">${x.name}</div>`;
  });

  res.send(layout("Categories",html));
});

// ================= SERVER =================
app.listen(3000,()=>{
  console.log("Server running on http://localhost:3000");
});