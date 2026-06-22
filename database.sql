-- Crear la base de datos para el proyecto
CREATE DATABASE IF NOT EXISTS narrador_openai;

-- Seleccionar la base de datos recién creada
USE narrador_openai;

-- Crear la tabla para llevar el registro de generaciones de avatares por IP
CREATE TABLE IF NOT EXISTS user_generations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    generation_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
