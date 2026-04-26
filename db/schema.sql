-- TruAudit Pro Database Schema

-- departments must be created first because other tables reference it
CREATE TABLE department (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- users
CREATE TABLE user_account (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('auditor', 'qms_manager')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- audits
CREATE TABLE audit (
    audit_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_account(user_id),
    department_id INTEGER NOT NULL REFERENCES department(department_id),
    iso_section VARCHAR(20) NOT NULL,
    result VARCHAR(10) NOT NULL CHECK (result IN ('pass', 'fail')),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'in_work' CHECK (status IN ('in_work', 'submitted', 'in_review', 'closed')),
    completed_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- corrective actions
CREATE TABLE corrective_action (
    corrective_action_id SERIAL PRIMARY KEY,
    audit_id INTEGER NOT NULL REFERENCES audit(audit_id),
    department_id INTEGER NOT NULL REFERENCES department(department_id),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- recommendations
CREATE TABLE recommendation (
    recommendation_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_account(user_id),
    department_id INTEGER NOT NULL REFERENCES department(department_id),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'not_feasible')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    addressed_at TIMESTAMP
);

-- seed departments
INSERT INTO department (name) VALUES
    ('Engineering'),
    ('Production'),
    ('Quality Assurance'),
    ('Logistics');

-- seed test users (passwords are placeholder hashes, will be replaced with bcrypt)
INSERT INTO user_account (name, email, password_hash, role) VALUES
    ('Test Auditor', 'auditor@truaudit.com', 'placeholder', 'auditor'),
    ('Test Manager', 'manager@truaudit.com', 'placeholder', 'qms_manager');