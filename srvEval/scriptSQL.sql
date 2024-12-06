CREATE DATABASE pEval CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
USE pEval;

CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL,
    remark TEXT,
    evaluator VARCHAR(10) NOT NULL
);

CREATE TABLE student_logins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE appreciations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    project_id INT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE criteria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appreciation_id INT NOT NULL,
    criteria_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(10) NOT NULL,
    checked BOOLEAN NOT NULL,
    FOREIGN KEY (appreciation_id) REFERENCES appreciations(id)
);
