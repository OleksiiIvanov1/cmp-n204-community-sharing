Community Share

CMP-N204 Software Engineering – Sprint 1

Project Overview

Community Share is a full-stack web application developed as part of the Software Engineering module.

The purpose of the application is to support sharing, exchange, and community building by allowing users to connect and exchange skills, resources, or support for mutual benefit rather than financial gain.

The system is database-driven and built using a Docker-based development environment to ensure consistency across the team.

During Sprint 1, the focus was on project setup, workflow organisation, and environment configuration rather than implementing application features.

Technologies Used

Frontend

HTML

CSS

JavaScript

PUG (templating system)

Backend

Node.js

Express.js

MySQL

DevOps

Docker

Docker Compose

Git & GitHub

Development Environment

This project uses Docker to provide a consistent development setup for all team members.

The Docker configuration includes:

Node.js application container

MySQL database container

phpMyAdmin (for database management)

Using Docker ensures:

All team members use the same environment

No dependency conflicts

Easy setup and deployment

How to Run the Project

Make sure Docker Desktop is installed and running.

Clone the repository:

git clone <your-repository-link>
cd <project-folder>


Build and start the containers:

docker-compose up --build


Access the application:

Express app:
http://localhost:3000

phpMyAdmin:
http://localhost:8081

Environment Variables

The project uses a .env file for database credentials.

An example file (env-sample) is provided.

To set up locally:

Copy env-sample

Rename it to .env

Adjust credentials if needed

The .env file is ignored via .gitignore for security reasons.

Current Sprint Status (Sprint 1)

The following has been completed:

GitHub repository created

GitHub Project Kanban board created

Initial product backlog prepared

Scaffolding files added

Docker development environment configured

All members able to run the environment locally

No application features have been implemented yet, as Sprint 1 focuses on workflow and infrastructure setup.

Repository Structure (Simplified)
/app              → Express application files
/db               → Database-related files
Dockerfile        → Node container configuration
docker-compose.yml
package.json
README.md
