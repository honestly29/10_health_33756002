-- Insert data into the tables

USE health;

INSERT INTO users (username, hashed_password, user_role) VALUES
('gold_patient',      '$2b$10$HwhVp39nqGpj4DodVVK3GOo8sAFfQD.0iqXwnkvxAskfebr2deicK', 'patient'),
('patient1',  '$2a$10$ReAjexvM662z/E0glZ8LsOAUDb/6QFtfPFGb4/BmbSsR5LeWOKyTm', 'patient'),
('patient2',  '$2a$10$4RgESg6HgyntolVtJw1IY.csr9e084cVEflumtOwl7.c6SUW0RGxS', 'patient'),
('patient3',  '$2a$10$7Ka7jtBT2MzZcW/BvpjDXOtKdmhkQSteLZDT.h44/MkhFSJWPu/4a', 'patient'),
('patient4',  '$2a$10$cpz39/xdk/WBow6B8QrNPuGgioJZEu.9U0kTDhkGLYWaomEMhQmv.', 'patient'),
('patient5',  '$2a$10$r2QFmZStgZ8kXtBynj.Zneaa1eKEY6sYdQTwHGf6bS2J27xqBnX4O', 'patient'),

('gold_doctor',      '$2b$10$HwhVp39nqGpj4DodVVK3GOo8sAFfQD.0iqXwnkvxAskfebr2deicK', 'staff'),
('doctor1',   '$2a$10$HrxiK0ch32AEyXoJ/4HlteKBSYUHgjlYED4xLhpxc7bQ44x4wXt7.', 'staff'),
('doctor2',   '$2a$10$AVMTa5D2U3RxBX/kYv016uIzSf4BjNTUqPNwwI1Jxj6wpd0s2C3C6', 'staff'),
('nurse1',    '$2a$10$jd0CoWbTUrclBMxdVpHfpOclyORS9GUYDgQ4lSkOoD/2u9kb.O44K', 'staff'),
('nurse2',    '$2a$10$28f.2IJmFzOZiWglw1IzHOKfohOxfFQiEC1pFO4SH8ym6tWZS47Sy', 'staff'),
('therapist1','$2a$10$rHPC/LCVqHNtkmyvffhJ2uQ1vgwHsGNe0/k0yZnpnNU3Uh5DM0ECm', 'staff');


-- Insert patient record
INSERT INTO patients (user_id, first_name, last_name, email, phone, notes)
VALUES
((SELECT id FROM users WHERE username='gold_patient'),     'Gold',     'Smiths',    'gold.smiths@example.com', '07000000000', 'No known issues'),
((SELECT id FROM users WHERE username='patient1'), 'John',     'Smith',     'john@example.com',     '07111111111', 'No allergies'),
((SELECT id FROM users WHERE username='patient2'), 'Lucy',     'Wong',      'lucy@example.com',     '07222222222', 'Diabetic type 2'),
((SELECT id FROM users WHERE username='patient3'), 'Michael',  'Brown',     'michael@example.com',  '07333333333', 'Recovering from surgery'),
((SELECT id FROM users WHERE username='patient4'), 'Sarah',    'Jones',     'sarah@example.com',    '07444444444', 'Asthma'),
((SELECT id FROM users WHERE username='patient5'), 'Daniel',   'Taylor',    'daniel@example.com',   '07555555555', 'High blood pressure');


-- Insert staff record
INSERT INTO staff (user_id, first_name, last_name, role_title, email, phone)
VALUES
((SELECT id FROM users WHERE username='gold_doctor'),     'Gold',     'Doctors',  'Senior Doctor', 'gold.doctors@clinic.com', '02080000000'),
((SELECT id FROM users WHERE username='doctor1'),   'Alice',   'Green',   'Doctor',     'alice.green@clinic.com',    '02080000001'),
((SELECT id FROM users WHERE username='doctor2'),   'Robert',  'White',   'Doctor',     'robert.white@clinic.com',   '02080000002'),
((SELECT id FROM users WHERE username='nurse1'),    'Emily',   'Johnson', 'Nurse',      'emily.johnson@clinic.com',  '02080000003'),
((SELECT id FROM users WHERE username='nurse2'),    'James',   'Clark',   'Nurse',      'james.clark@clinic.com',    '02080000004'),
((SELECT id FROM users WHERE username='therapist1'),'Sophie',  'Hall',    'Therapist',  'sophie.hall@clinic.com',    '02080000005');


-- Insert appointment record
INSERT INTO appointments (patient_id, staff_id, appointment_date, reason, appointment_status)
VALUES
((SELECT id FROM patients WHERE first_name='Gold'),    (SELECT id FROM staff WHERE last_name='Doctors'), '2025-01-05 10:00:00', 'Initial consultation', 'completed'),
((SELECT id FROM patients WHERE first_name='Gold'),    (SELECT id FROM staff WHERE last_name='Doctors'), '2025-02-15 15:30:00', 'Follow-up visit', 'completed'),       
((SELECT id FROM patients WHERE first_name='Gold'),    (SELECT id FROM staff WHERE last_name='Green'), '2025-05-20 09:00:00', 'Routine checkup', 'cancelled'),
((SELECT id FROM patients WHERE first_name='Gold'),    (SELECT id FROM staff WHERE last_name='Clark'), '2025-08-25 11:15:00', 'Lab results discussion', 'completed'),
((SELECT id FROM patients WHERE first_name='Gold'),    (SELECT id FROM staff WHERE last_name='Clark'), '2025-12-27 12:00:00', 'Routine checkup', 'booked'),


((SELECT id FROM patients WHERE first_name='John'),    (SELECT id FROM staff WHERE last_name='Green'), '2025-10-10 09:00:00', 'Routine checkup', 'completed'),
((SELECT id FROM patients WHERE first_name='John'),    (SELECT id FROM staff WHERE last_name='Green'), '2025-12-10 14:30:00', 'Follow-up exam', 'completed'),
((SELECT id FROM patients WHERE first_name='John'),    (SELECT id FROM staff WHERE last_name='Doctors'), '2026-01-10 14:30:00', 'Blood check', 'booked'),

((SELECT id FROM patients WHERE first_name='Lucy'),    (SELECT id FROM staff WHERE last_name='White'), '2025-02-05 11:00:00', 'Diabetes review', 'completed'),
((SELECT id FROM patients WHERE first_name='Lucy'),    (SELECT id FROM staff WHERE last_name='Clark'), '2025-03-12 10:00:00', 'Blood pressure test', 'cancelled'),

((SELECT id FROM patients WHERE first_name='Michael'), (SELECT id FROM staff WHERE last_name='Doctors'), '2025-04-01 09:30:00', 'Wound check', 'completed'),
((SELECT id FROM patients WHERE first_name='Michael'), (SELECT id FROM staff WHERE last_name='Hall'),    '2025-04-15 15:00:00', 'Physiotherapy session', 'completed'),

((SELECT id FROM patients WHERE first_name='Sarah'),   (SELECT id FROM staff WHERE last_name='Clark'), '2025-05-10 13:00:00', 'Asthma review', 'completed'),
((SELECT id FROM patients WHERE first_name='Sarah'),   (SELECT id FROM staff WHERE last_name='White'), '2025-06-20 16:00:00', 'Allergy consultation', 'completed'),

((SELECT id FROM patients WHERE first_name='Daniel'),  (SELECT id FROM staff WHERE last_name='Doctors'), '2026-01-07 09:00:00', 'Heart check', 'cancelled'),
((SELECT id FROM patients WHERE first_name='Daniel'),  (SELECT id FROM staff WHERE last_name='Hall'),  '2025-08-14 12:30:00', 'Rehabilitation session', 'completed'),

((SELECT id FROM patients WHERE first_name='Daniel'),  (SELECT id FROM staff WHERE last_name='Johnson'), '2025-09-01 10:45:00', 'Nurse assessment', 'completed'),
((SELECT id FROM patients WHERE first_name='Lucy'),    (SELECT id FROM staff WHERE last_name='Green'),  '2025-10-22 14:00:00', 'General checkup', 'completed');