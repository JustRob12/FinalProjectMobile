-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS mobile_app_db;
USE mobile_app_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add index on email for faster lookups
CREATE INDEX idx_email ON users(email);

-- Add index on google_id for faster lookups
CREATE INDEX idx_google_id ON users(google_id); 