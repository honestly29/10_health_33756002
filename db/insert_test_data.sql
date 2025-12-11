-- Insert data into the tables

USE health;

INSERT INTO users (username, hashed_password, user_role) 
VALUES
('gold', '$2b$10$HwhVp39nqGpj4DodVVK3GOo8sAFfQD.0iqXwnkvxAskfebr2deicK', 'patient'),
('patient1', '$2a$10$V1blb3KdEoVGqQSODaBKRu35ikqRhioJ8yEqJXfiiDdleBBuc5.eS', 'patient'),
('doctor1', '$2a$10$lySpgJonTQwm2U7exIvwruLtLgUEyEAFKswTNcLpQ/TQf6KcsFnTi', 'staff');


-- Insert patient record
INSERT INTO patients (user_id, first_name, last_name, email, phone, notes)
VALUES
(
    (SELECT id FROM users WHERE username = 'patient1'),
    'patient1',
    'patient1',
    'patient1@example.com',
    '0123456789',
    'No known allergies.'
);


-- Insert staff record
INSERT INTO staff (user_id, first_name, last_name, role_title, email, phone)
VALUES
(
    (SELECT id FROM users WHERE username = 'doctor1'),
    'doctor1',
    'doctor1',
    'Doctor',
    'doctor1@example.com',
    '9876543210'
);


-- Insert appointment record
INSERT INTO appointments (patient_id, staff_id, appointment_date, reason, appointment_status)
VALUES
(
    (SELECT id FROM patients WHERE first_name = 'patient1' AND last_name = 'patient1'),
    (SELECT id FROM staff WHERE role_title = 'Doctor'),
    '2025-01-01 10:00:00',
    'General Checkup',
    'completed'
);

INSERT INTO appointments (patient_id, staff_id, appointment_date, reason, appointment_status)
VALUES
(
    (SELECT id FROM patients WHERE first_name = 'patient1' AND last_name = 'patient1'),
    (SELECT id FROM staff WHERE role_title = 'Doctor'),
    '2025-12-30 10:00:00',
    'Blood Test',
    'booked'
);