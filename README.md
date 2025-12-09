# MyPage

nothing

## Database

The application uses a relational MySQL database designed to support authentication, patient management, staff management, and appointment scheduling. The model consists of four related tables: **users**, **patients**, **staff**, and **appointments**.

A separate **users** table stores login credentials and roles. Patients and staff reference user accounts through foreign keys, allowing the system to distinguish authenticated users while still supporting patients without logins. The **appointments** table links patients and staff, enforcing referential integrity through cascading rules so that invalid or orphaned appointments cannot exist. This structure supports secure authentication, clean role separation, and reliable clinic booking functionality.
