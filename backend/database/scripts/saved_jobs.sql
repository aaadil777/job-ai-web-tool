-- Table: saved_jobs

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