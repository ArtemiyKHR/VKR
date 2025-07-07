const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
                                                 id SERIAL PRIMARY KEY,
                                                 first_name VARCHAR(50) NOT NULL,
                                                 last_name VARCHAR(50) NOT NULL,
                                                 patronymic VARCHAR(50),
                                                 phone VARCHAR(20) NOT NULL,
                                                 email VARCHAR(100) UNIQUE NOT NULL,
                                                 password VARCHAR(255) NOT NULL,
                                                 role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin', 'master')),
                                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS Messages (
                                                    id SERIAL PRIMARY KEY,
                                                    name VARCHAR(100) NOT NULL,
                                                    email VARCHAR(100) NOT NULL,
                                                    message TEXT NOT NULL,
                                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS Requests (
                                                    id SERIAL PRIMARY KEY,
                                                    title VARCHAR(100) NOT NULL,
                                                    description TEXT NOT NULL,
                                                    equipment_type VARCHAR(20),
                                                    contact_person VARCHAR(150) NOT NULL,
                                                    status VARCHAR(20) DEFAULT 'pending',
                                                    phone VARCHAR(20) NOT NULL,
                                                    user_id INTEGER REFERENCES Users(id),
                                                    repair_type VARCHAR(20),
                                                    executor_name VARCHAR(150),
                                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                    closed_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS Comments (
                                                    id SERIAL PRIMARY KEY,
                                                    request_id INTEGER REFERENCES Requests(id),
                                                    user_id INTEGER REFERENCES Users(id),
                                                    full_name VARCHAR(150) NOT NULL,
                                                    message TEXT NOT NULL,
                                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'requests' 
                    AND column_name = 'executor_id'
                ) THEN
                    ALTER TABLE Requests 
                    ADD COLUMN executor_id INTEGER REFERENCES Users(id);
                END IF;
            END $$;
        `);

        console.log('Базы данных созданы или успешно обновлены');
    } catch (error) {
        console.error('Ошибка создания или обновления БД:', error);
    }
}

initializeDatabase();

module.exports = { pool };