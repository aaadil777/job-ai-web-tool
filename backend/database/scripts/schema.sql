-- SQL schema and database setup

CREATE DATABASE IF NOT EXISTS jobhunter_ai;
USE jobhunter_ai;

-- 1. USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('jobseeker', 'recruiter', 'admin') DEFAULT 'jobseeker',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER PROFILES
CREATE TABLE user_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    experience_level ENUM('entry', 'mid', 'senior', 'executive') DEFAULT 'entry',
    bio TEXT,
    location VARCHAR(150),
    desired_industry VARCHAR(150),
    desired_salary DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. USER SKILLS
CREATE TABLE user_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency ENUM('beginner','intermediate','advanced','expert') DEFAULT 'beginner',
    years_experience INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. EDUCATION
CREATE TABLE education (
    edu_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    institution VARCHAR(150),
    degree VARCHAR(100),
    field_of_study VARCHAR(100),
    graduation_year YEAR,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. CERTIFICATIONS
CREATE TABLE certifications (
    cert_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    certification_name VARCHAR(150),
    issuer VARCHAR(150),
    year_obtained YEAR,
    expiration_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. RESUMES
CREATE TABLE resumes (
    resume_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_path VARCHAR(255),
    parsed_text LONGTEXT,
    upload_source ENUM('manual','parsed') DEFAULT 'manual',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. JOBS
CREATE TABLE jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    industry VARCHAR(100),
    description TEXT,
    location VARCHAR(100),
    requirements TEXT,
    salary_range VARCHAR(100),
    source ENUM('internal','api') DEFAULT 'internal',
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. JOB RECOMMENDATIONS
CREATE TABLE job_recommendations (
    rec_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    match_score DECIMAL(5,2),
    generated_resume LONGTEXT,
    generated_cover_letter LONGTEXT,
    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);

-- 9. SAVED JOBS
CREATE TABLE IF NOT EXISTS saved_jobs (
    saved_job_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    date_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(255),

    CONSTRAINT fk_savedjobs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_savedjobs_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(job_id)
        ON DELETE CASCADE
);

-- Prevent users from saving the same job multiple times
ALTER TABLE saved_jobs
    ADD UNIQUE KEY uq_user_job (user_id, job_id);

-- 10. Ensure jobs table supports API persistence
-- Add URL and source columns if missing (for Adzuna/API jobs)
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS source ENUM('internal','api') DEFAULT 'internal';

-- Create a unique composite key to prevent duplicates
-- This allows UPSERT (ON DUPLICATE KEY UPDATE) in Flask
ALTER TABLE jobs
    ADD UNIQUE KEY uq_job_unique (title, company_name, location, url);
