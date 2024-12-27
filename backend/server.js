const express = require('express');
    const cors = require('cors');
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcryptjs');
    const { Pool } = require('pg');
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const app = express();
    app.use(cors());
    app.use(express.json());

    // Middleware pour vérifier le token JWT
    function authenticateToken(req, res, next) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token == null) return res.sendStatus(401);

      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    }

    // Routes pour l'authentification
    app.post('/api/register', async (req, res) => {
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      try {
        const result = await pool.query(
          'INSERT INTO users (email, password_hashed) VALUES ($1, $2) RETURNING *',
          [email, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/login', async (req, res) => {
      const { email, password } = req.body;
      try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hashed);
        if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Routes pour les utilisateurs
    app.get('/api/users', authenticateToken, async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        res.json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Routes pour les crédits
    app.get('/api/credits', authenticateToken, async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM credits WHERE utilisateur_id = $1', [req.user.id]);
        res.json(result.rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Routes pour les transactions
    app.get('/api/transactions', authenticateToken, async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM transactions WHERE utilisateur_id = $1', [req.user.id]);
        res.json(result.rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Routes pour le traitement des images
    app.post('/api/process-image', authenticateToken, async (req, res) => {
      try {
        // Intégration Huggingface pour le traitement des images
        // Exemple de requête à Huggingface
        const response = await fetch('https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer your_huggingface_token',
          },
          body: JSON.stringify({
            inputs: req.body.prompt,
          }),
        });
        const data = await response.json();
        res.json(data);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Routes pour la facturation avec Stripe
    app.post('/api/create-checkout-session', authenticateToken, async (req, res) => {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Klyra Credits',
                },
                unit_amount: 2000, // 20 USD
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.CLIENT_URL}/success`,
          cancel_url: `${process.env.CLIENT after payment`,
        });
        res.json({ id: session.id });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
