-- SupportIQ Database Schema for PostgreSQL

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Support Agent', -- Roles: Admin, Support Agent, Viewer
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- pdf, docx, txt, md, csv
    file_size BIGINT NOT NULL,
    doc_category VARCHAR(100) DEFAULT 'General Knowledge',
    chunk_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'processed', -- uploaded, processing, processed, error
    uploaded_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Queries Table
CREATE TABLE IF NOT EXISTS queries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    original_query TEXT NOT NULL,
    optimized_query TEXT,
    detected_category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Responses Table
CREATE TABLE IF NOT EXISTS responses (
    id VARCHAR(36) PRIMARY KEY,
    query_id VARCHAR(36) REFERENCES queries(id) ON DELETE CASCADE,
    llm_provider VARCHAR(50) NOT NULL, -- Gemini, OpenAI, Groq
    generated_answer TEXT NOT NULL,
    confidence_score FLOAT NOT NULL DEFAULT 0.0,
    is_escalated BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    citations JSONB DEFAULT '[]'::jsonb,
    agent_trace JSONB DEFAULT '[]'::jsonb,
    execution_time_ms INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(36) PRIMARY KEY,
    response_id VARCHAR(36) REFERENCES responses(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5), -- 1 to 5 stars or binary (1/5)
    is_helpful BOOLEAN,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
    id VARCHAR(36) PRIMARY KEY,
    metric_date DATE DEFAULT CURRENT_DATE,
    total_queries INT DEFAULT 0,
    avg_confidence FLOAT DEFAULT 0.0,
    escalation_rate FLOAT DEFAULT 0.0,
    avg_response_time_ms FLOAT DEFAULT 0.0,
    satisfaction_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Admin Seed User (password: admin123)
INSERT INTO users (id, email, full_name, hashed_password, role)
VALUES (
    'usr-admin-001', 
    'admin@supportiq.ai', 
    'System Admin', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
    'Admin'
) ON CONFLICT (email) DO NOTHING;
