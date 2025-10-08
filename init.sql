-- Criação do banco de dados e configurações iniciais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários para autenticação
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin padrão
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@workshop.com', '$2b$10$YourHashedPasswordHere', 'admin')
ON CONFLICT (username) DO NOTHING;