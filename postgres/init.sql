DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS bars CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE, -- Am scos NOT NULL ca sa nu crape la register
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    firstname VARCHAR(255),     -- <--- COLOANA NOUA
    lastname VARCHAR(255),      -- <--- COLOANA NOUA
    points_balance INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    bar_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    points_cost INT NOT NULL,
    image_url VARCHAR(255),
    CONSTRAINT fk_bar_reward FOREIGN KEY (bar_id) REFERENCES bars(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    bar_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    points_earned INT NOT NULL,
    qr_code_hash VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_trx FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_bar_trx FOREIGN KEY (bar_id) REFERENCES bars(id) ON DELETE SET NULL
);

-- USER DE TEST (parola: password)
INSERT INTO users (email, password, role, firstname, lastname, points_balance) VALUES
('dev@student.tuiasi.ro', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'ROLE_CLIENT', 'Student', 'Test', 50)
ON CONFLICT (email) DO NOTHING;