CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hashed VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      preferred_language VARCHAR(50) DEFAULT 'fr'
    );

    CREATE TABLE credits (
      id SERIAL PRIMARY KEY,
      utilisateur_id INT REFERENCES users(id) ON DELETE CASCADE,
      credits_restants INT NOT NULL,
      date_achat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      utilisateur_id INT REFERENCES users(id) ON DELETE CASCADE,
      montant DECIMAL(10, 2) NOT NULL,
      type VARCHAR(50) NOT NULL,
      date_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
