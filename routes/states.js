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

  module.exports = router;