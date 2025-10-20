-- Create Database (Run this first if your database doesn't exist)
CREATE DATABASE IF NOT EXISTS college_elections;
USE college_elections;

-- Create Voters Table
CREATE TABLE voters (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50),
    year VARCHAR(20),
    -- Store password securely using PHP's password_hash function (e.g., $2y$...)
    password_hash VARCHAR(255) NOT NULL, 
    has_voted BOOLEAN DEFAULT FALSE,
    registration_status ENUM('pending', 'approved') DEFAULT 'approved'
);

-- Create Candidates Table
CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    year VARCHAR(20),
    manifesto TEXT,
    symbol VARCHAR(50),
    -- Ensures a candidate's name is unique for a given position
    UNIQUE KEY unique_candidate_position (name, position) 
);

-- Create Votes Table (Tracks which voter voted for which candidate in which position)
CREATE TABLE votes (
    voter_id VARCHAR(20) NOT NULL,
    candidate_id INT NOT NULL,
    position VARCHAR(50) NOT NULL,
    vote_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Voter can only vote once per position (ensures one vote per user per office)
    PRIMARY KEY (voter_id, position), 
    FOREIGN KEY (voter_id) REFERENCES voters(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- Initial Data Insertion

-- Password for both users is 'password' (Hashed using password_hash('password', PASSWORD_DEFAULT))
-- You should change this password in a real system!
INSERT INTO voters (id, name, email, department, year, password_hash) VALUES
('CS2021001', 'Arjun Singh', 'arjun.singh@college.edu', 'Computer Science', '3rd Year', '$2y$10$t2.OQn821sP/Bw.F.hH.hOFoF.Xq/5A/9pLqN5u82OQ9uO7P2wQ7S'),
('EC2020055', 'Kavya Reddy', 'kavya.reddy@college.edu', 'Electronics', '4th Year', '$2y$10$t2.OQn821sP/Bw.F.hH.hOFoF.Xq/5A/9pLqN5u82OQ9uO7P2wQ7S');

INSERT INTO candidates (name, position, department, year, manifesto, symbol) VALUES
('Rajesh Kumar', 'President', 'Computer Science', '3rd Year', 'Focused on improving campus infrastructure and student welfare', 'Book'),
('Priya Sharma', 'President', 'Electronics', '4th Year', 'Advocating for better academic facilities and career guidance', 'Lamp'),
('Amit Patel', 'Vice President', 'Mechanical', '3rd Year', 'Promoting sports and extracurricular activities', 'Star'),
('Sneha Gupta', 'Secretary', 'Civil', '2nd Year', 'Improving student services and administrative processes', 'Pen');

-- Add Admin Credentials (Simple, static check - for production use a separate table)
-- Admin Username: 'admin', Password: 'admin123' (Not stored securely since it's hardcoded in api.php)