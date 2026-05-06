# Community Share – Student Skill Exchange 

This project is developed for the CMP-N204 Software Engineering module.
Community Share is a student-focused platform where users can exchange skills such as programming help, language practice, CV feedback, or interview preparation without any financial transactions.

The goal of the project is to encourage collaboration between students by creating a simple and structured environment where people can offer and request support from each other. 

---

## Project Idea

Many students need help with academic or practical skills but may not always have access to paid services. At the same time, other students have useful knowledge they are willing to share.
Community Share connects these users through profiles, skill listings, and request management features.

---

## Technologies Used

Frontend:

* HTML
* CSS
* JavaScript
* PUG templates

Backend: 

* Node.js
* Express.js
* MySQL

Tools:

* Docker
* GitHub Projects (Kanban Board)

---

## Current Progress
Sprint 1 focused on setting up the repository, Docker environment, and project structure.
Sprint 2 focused on system design, including user stories, diagrams, wireframes, and database planning.
Sprint 3 delivered the first dynamic database-driven features: skills listing, skill detail page, create skill, users list and user profile, plus a database test endpoint.

The application runs in Docker containers using Node.js, Express, MySQL, and Pug.

### Sprint 4 (`shannel-sprint4` branch)

This branch delivers a vertical slice of the original Community Share concept, developed independently after the team explored a different direction. Tracked in PR #74. Highlights:

- **Real database schema** — replaced the placeholder schema (which was a renamed `package-lock.json`) with proper `users`, `categories`, `skills` and `requests` tables, including bcrypt-hashed sample data.
- **Full authentication** — register, login, logout using `express-session` and `bcrypt`. Smart navigation reflects logged-in state.
- **Skill exchange flow** — logged-in users can request a skill (with duplicate-prevention and self-request guards). Skill owners get a `/requests` management page with Accept / Reject actions and proper authorisation checks.
- **Profile page** — view any user's profile and skills offered. Logged-in users can edit their own name, email and password from `/profile/edit`.
- **Email notifications** — Nodemailer with Ethereal Email sends notification emails on request creation, accept and reject. Preview URLs are logged to the container console for demo purposes.
- **CI** — GitHub Actions workflow (`.github/workflows/ci.yml`) installs dependencies and runs `node --check` against all JS files in `app/` on every push and pull request.

#### Test logins

The dev database is seeded with sample users — all use the password `password123`:

- `alex@example.com`
- `daniela@example.com`
- `ahmed@example.com`

#### Test flow

1. Login as Alex → `/skills` → Request Exchange on a skill owned by Daniela
2. Logout, login as Daniela → `/requests` → Accept or Reject
3. Watch the container logs for the email preview URL
---

## Documentation

Design and planning documents are included inside the repository.
These cover:

* Use case diagram
* Wireframes
* Activity flow
* Database ER diagram
* Sprint planning

---

## Project Management

Kanban Board:
https://github.com/users/OleksiiIvanov1/projects/2

We use the GitHub project board to organise tasks, assign responsibilities, and track sprint progress.

---

## Group Members

Oleksii Ivanov – A00034498
Mehedi Hasan Rakib – A00022820
Shannel Keny Rodrigues – A00025655
Abbas Mohamad – A00041006

---

## Running the Project

Make sure Docker Desktop is installed and running.
Clone the repository and start the containers using docker-compose. 

Further setup instructions will be updated during development.
