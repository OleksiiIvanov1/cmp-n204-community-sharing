-- ============================================================
-- Community Share — Database Schema
-- Author: Shannel Rodrigues
-- Description: Creates the four core tables for the Community
-- Share platform: categories, users, skills, and requests.
-- ============================================================


-- Drop existing tables in reverse order of dependency
-- (requests depends on skills+users; skills depends on users+categories)
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;


-- ------------------------------------------------------------
-- Table 1: categories
-- ------------------------------------------------------------

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);


-- ------------------------------------------------------------
-- Table 2: users
-- password_hash stores a bcrypt hash, never plain text.
-- ------------------------------------------------------------

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- Table 3: skills
-- ------------------------------------------------------------

CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);


-- ------------------------------------------------------------
-- Table 4: requests
-- ------------------------------------------------------------

CREATE TABLE requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  skill_id INT NOT NULL,
  requester_id INT NOT NULL,
  status ENUM('Pending', 'Accepted', 'Rejected') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ============================================================
-- Sample Data
-- ============================================================

-- Categories
INSERT INTO categories (name) VALUES
  ('Programming'),
  ('Languages'),
  ('Career'),
  ('Mathematics'),
  ('Music');

-- Users
-- Sample password for all 3 users is "password123"
-- (bcrypt hash, for development only)
INSERT INTO users (name, email, password_hash) VALUES
  ('Alex Carter', 'alex@example.com', '$2b$10$1Jo9xEKlJ55XBucA9yvnuORYAtWtgna765stoYJqxVsL1xdP4Vnf2'),
  ('Daniela Rivera', 'daniela@example.com', '$2b$10$1Jo9xEKlJ55XBucA9yvnuORYAtWtgna765stoYJqxVsL1xdP4Vnf2'),
  ('Ahmed Malik', 'ahmed@example.com', '$2b$10$1Jo9xEKlJ55XBucA9yvnuORYAtWtgna765stoYJqxVsL1xdP4Vnf2');

-- Skills
INSERT INTO skills (title, description, user_id, category_id) VALUES
  ('Java Programming Help', 'Help with Java basics, OOP, and debugging.', 1, 1),
  ('Spanish Conversation Practice', 'Practice your Spanish speaking skills.', 2, 2),
  ('Mock Interview Sessions', 'Realistic mock interviews for job prep.', 3, 3);

-- A sample request: Daniela (id 2) requests the Java skill (id 1)
INSERT INTO requests (skill_id, requester_id) VALUES
  (1, 2);