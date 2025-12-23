-- script de initializare pentru baza de date barloyalty
-- aici cream structura si bagam niste date de test

-- 1. curatenie
-- stergem tabelele vechi daca exista, ca sa nu avem erori cand dam restart
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS bars CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. tabelul users
-- aici tinem minte clientii si adminii barurilor
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- aici o sa fie parola criptata
    role VARCHAR(20) NOT NULL CHECK (role IN ('ROLE_CLIENT', 'ROLE_ADMIN', 'ROLE_BAR_OWNER')),
    points_balance INT DEFAULT 0 CHECK (points_balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. tabelul bars
-- locatiile fizice unde merg studentii
CREATE TABLE bars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. tabelul rewards
-- aici sunt premiile pe care le pot cumpara clientii cu puncte
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    bar_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    points_cost INT NOT NULL CHECK (points_cost > 0), -- cat costa premiul
    image_url VARCHAR(255), -- link catre poza daca facem frontend
    CONSTRAINT fk_bar_reward FOREIGN KEY (bar_id) REFERENCES bars(id) ON DELETE CASCADE
);

-- 5. tabelul transactions
-- istoricul platilor si validarea qr
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    bar_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL, -- cati bani a cheltuit real
    points_earned INT NOT NULL, -- cate puncte a primit
    qr_code_hash VARCHAR(255) UNIQUE, -- codul unic din qr pentru siguranta
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_trx FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_bar_trx FOREIGN KEY (bar_id) REFERENCES bars(id) ON DELETE SET NULL
);


-- date de test (seed data)
-- bagam niste date false ca sa avem cu ce lucra in aplicatie

-- a. adaugam cativa useri
-- nota: parolele sunt 'pass123'
INSERT INTO users (username, email, password, role, points_balance) VALUES
('student_dev', 'dev@student.tuiasi.ro', 'pass123', 'ROLE_CLIENT', 50),
('party_animal', 'party@example.com', 'pass123', 'ROLE_CLIENT', 1200),
('bar_admin', 'admin@thebar.com', 'pass123', 'ROLE_ADMIN', 0);

-- b. adaugam barurile partenere
INSERT INTO bars (name, location) VALUES
('The Coding Pub', 'Campus Studentesc, Iasi'),
('Debug Lounge', 'Centrul Vechi, Bucuresti');

-- c. adaugam premiile disponibile
-- pentru coding pub
INSERT INTO rewards (bar_id, name, points_cost) VALUES
(1, 'Free Coffee', 100),
(1, 'Discount 50% Burger', 500);

-- pentru debug lounge
INSERT INTO rewards (bar_id, name, points_cost) VALUES
(2, 'Shot of Python', 200);

-- d. adaugam niste tranzactii vechi
INSERT INTO transactions (user_id, bar_id, amount, points_earned, qr_code_hash, status, created_at) VALUES
(1, 1, 50.00, 50, 'hash_qr_unique_123', 'COMPLETED', NOW() - INTERVAL '1 DAY'),
(2, 1, 150.50, 150, 'hash_qr_unique_456', 'COMPLETED', NOW() - INTERVAL '2 HOURS');

-- verificam daca s-au bagat
SELECT count(*) as users_count FROM users;