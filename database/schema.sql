
-- Schema for Promedid Database

-- Treatments Table
CREATE TABLE IF NOT EXISTS treatments (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    category ENUM('Diagnóstico', 'Sueroterapia', 'Terapias', 'Estética', 'Multivitamínicos') NOT NULL,
    subcategory VARCHAR(100),
    tag VARCHAR(100),
    imageUrl TEXT,
    price VARCHAR(50),
    packagePrice VARCHAR(100),
    discount VARCHAR(50) DEFAULT NULL,
    active TINYINT(1) DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Benefits Table (One-to-many relationship)
CREATE TABLE IF NOT EXISTS treatment_benefits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    treatment_id VARCHAR(100),
    benefit TEXT NOT NULL,
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
);

-- Supplements Table
CREATE TABLE IF NOT EXISTS supplements (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    imageUrl TEXT,
    price VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplement-Treatment Mapping (Many-to-many)
CREATE TABLE IF NOT EXISTS supplement_matching (
    supplement_id VARCHAR(100),
    treatment_id VARCHAR(100),
    PRIMARY KEY (supplement_id, treatment_id),
    FOREIGN KEY (supplement_id) REFERENCES supplements(id) ON DELETE CASCADE,
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
);
