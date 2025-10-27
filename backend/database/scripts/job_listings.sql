-- Table: job_listings

CREATE TABLE IF NOT EXISTS job_listings (
    listing_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    location VARCHAR(150),
    job_type ENUM('full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid') DEFAULT 'full-time',
    description TEXT,
    requirements TEXT,
    salary_range VARCHAR(100),
    industry VARCHAR(100),
    source ENUM('internal','external','api') DEFAULT 'internal',
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url VARCHAR(255)
);