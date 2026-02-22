# Community Share  
CMP-N204 Software Engineering – Sprint 1  
### Authors
Oleksii Ivanov - A00034498

Mehedi Hasan Rakib - A00022820

Shannel Keny Rodrigues - A00025655

Abbas Mohamad - A00041006
## Project Overview

Community Share is a full-stack web application developed as part of the Software Engineering module (CMP-N204).

The purpose of the application is to support sharing, exchange, and community building. The system will allow users to create profiles, share skills or resources, and connect with others for mutual benefit rather than financial gain.

During Sprint 1, the focus has been on setting up the development workflow, configuring the Docker environment, and organising the repository structure. Application features will be implemented in later sprints.

---

## Technologies Used

### Frontend
- JavaScript   
- Dockerfile
  
### Backend
- Node.js  
- Express.js  
- MySQL  

### DevOps & Project Management
- Docker  
- Docker Compose  
- Git  
- GitHub  
- GitHub Projects (Kanban board)

---

## Development Environment

The project uses a Docker-based development environment to ensure consistency across all team members.

The Docker setup includes:

- A Node.js container for the Express application  
- A MySQL container for the database  
- A phpMyAdmin container for database management  

Using Docker ensures that:
- All team members run the same environment  
- There are no dependency conflicts  
- The project can be easily built and deployed  

---

## How to Run the Project

### 1. Requirements
- Docker Desktop installed and running  

### 2. Clone the Repository
git clone https://github.com/OleksiiIvanov1/cmp-n204-community-sharing.git

cd cmp-n204-community-sharing

### 3. Build and Start Containers
docker-compose up --build

### 4. Access the Application

- Express application:  
  http://localhost:3000  

- phpMyAdmin:  
  http://localhost:8081  

---

## Environment Variables

The project uses a `.env` file to store database credentials.

An example file (`env-sample`) is included in the repository.

To configure locally:

1. Copy `env-sample`
2. Rename it to `.env`
3. Adjust credentials if necessary

The `.env` file is excluded via `.gitignore` for security reasons.

---

## Current Sprint Status – Sprint 1

The following requirements have been completed:

- GitHub repository created  
- GitHub Project Kanban board created  
- Product backlog initiated  
- Scaffolding files added  
- Docker development environment configured  
- All team members able to run the environment locally  

No application features have been implemented yet, as Sprint 1 focuses on project setup and workflow preparation.

---

## Repository Structure 
/app → Express application files

/db → Database files

Dockerfile → Node.js container configuration

docker-compose.yml → Service configuration

package.json → Project dependencies

README.md → Project documentation


