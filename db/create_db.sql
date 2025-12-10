-- Create the database
CREATE DATABASE IF NOT EXISTS health;
USE health;

-- Users table
-- Stores login accounts for both patients and staff
-- Having a separate users table allows for easy authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    username           VARCHAR(50) NOT NULL UNIQUE,
    hashed_password    VARCHAR(255) NOT NULL,
    user_role          ENUM('patient', 'staff') NOT NULL DEFAULT 'patient',
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Patients table
-- Stores patient information
-- If a user account is deleted, the patient record is kept but user_id is set to NULL. This avoids losing patient medical history.
CREATE TABLE IF NOT EXISTS patients (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NULL,   -- Patients may not have an online account
    first_name         VARCHAR(100) NOT NULL,
    last_name          VARCHAR(100) NOT NULL,
    date_of_birth      DATE NOT NULL,
    email              VARCHAR(100),
    phone              VARCHAR(20),
    notes              TEXT,
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patients_users 
        FOREIGN KEY (user_id) REFERENCES users(id) 
            ON DELETE SET NULL
            ON UPDATE CASCADE
);


-- Staff table
-- Stores staff information
-- If a staff user account is deleted, the corresponding staff row is deleted too.
CREATE TABLE IF NOT EXISTS staff (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NOT NULL,
    first_name         VARCHAR(100) NOT NULL,
    last_name          VARCHAR(100) NOT NULL,
    role_title         VARCHAR(100) NOT NULL,
    email              VARCHAR(100),
    phone              VARCHAR(20),
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_users 
        FOREIGN KEY (user_id) REFERENCES users(id) 
            ON DELETE CASCADE
            ON UPDATE CASCADE
);


-- Appointments table
-- Links patients and staff with appointment details
-- If a patient or staff user is deleted, their appointments are also deleted. This keeps the table from filling up with orphaned rows.
CREATE TABLE IF NOT EXISTS appointments (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    patient_id          INT NOT NULL,
    staff_id            INT NOT NULL,
    appointment_date    DATETIME NOT NULL,
    reason              VARCHAR(255),
    appointment_status  ENUM('booked', 'completed', 'cancelled') NOT NULL DEFAULT 'booked',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointments_patients 
        FOREIGN KEY (patient_id) REFERENCES patients(id) 
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT fk_appointments_staff 
        FOREIGN KEY (staff_id) REFERENCES staff(id) 
            ON DELETE CASCADE
            ON UPDATE CASCADE
);


-- Create the application user
CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON health.* TO 'health_app'@'localhost';