-- Insert data into the tables

USE health;

INSERT INTO users (username, hashed_password, user_role) 
VALUES
('gold', '$2b$10$HwhVp39nqGpj4DodVVK3GOo8sAFfQD.0iqXwnkvxAskfebr2deicK', 'patient'),
('patient1', 'placeholder', 'patient'),
('doctor1', 'placeholder', 'staff');


-- Insert patient record
INSERT INTO patients (user_id, first_name, last_name, date_of_birth, email, phone, notes)
VALUES
(
    (SELECT id FROM users WHERE username = 'patient1'),
    'John',
    'Smith',
    '1990-01-01',
    'john@example.com',
    '0123456789',
    'No known allergies.'
);

-- Insert staff record
INSERT INTO staff (user_id, first_name, last_name, role_title, email, phone)
VALUES
(
    (SELECT id FROM users WHERE username = 'doctor1'),
    'Alice',
    'Smith',
    'Doctor',
    'alice@example.com',
    '9876543210'
);


-- Insert appointment record
INSERT INTO appointments (patient_id, staff_id, appointment_date, reason, appointment_status)
VALUES
(
    (SELECT id FROM patients WHERE first_name = 'John' AND last_name = 'Smith'),
    (SELECT id FROM staff WHERE last_name = 'Smith'),
    '2025-01-01 10:00:00',
    'General Checkup',
    'booked'
);