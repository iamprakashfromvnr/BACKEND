// routes/states.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const cors = require('cors');
// GET all states
const app =express();
app.use(cors());
app.use(express.json());
router.get('/states', (req, res) => {
    db.query('SELECT * FROM states WHERE is_active = 1', (err, results) => {
      if (err) {
        res.status(500).send("Database query error");
      } else {
        res.json(results);
      }
    });
  });
router.get('/districts', (req, res) => {
    const stateId = req.query.stateId;
    if (!stateId) {
        return res.status(400).json({ error: 'State ID is required' });
    }

    const query = 'SELECT * FROM districts WHERE state_id = ?';
    db.query(query, [stateId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

module.exports = router;