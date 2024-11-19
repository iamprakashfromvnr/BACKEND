// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const cors = require('cors');
// GET all category
const app =express();
app.use(cors());
app.use(express.json());
router.get('/subcategory', (req, res) => {
  db.query('SELECT subcategory.subcategory_name,category.category_name FROM subcategory JOIN category ON subcategory.category_id = category.id WHERE subcategory.is_active = 1', (err, results) => {
    if (err) {
      res.status(500).send("Database query error");
    } else {
      res.json(results);
    }
  });
});

// ADD a new category
router.post('/subcategory', (req, res) => {
  const {subCategory,category_id} = req.body;
  console.log(subCategory, category_id);
  const query = 'INSERT INTO subcategory (subcategory_name,category_id) VALUES (?,?)';
  db.query(query, [subCategory,category_id], (err, result) => {
    if (err) {
      res.status(500).send("Database insertion error",err);
    } else {
      res.json({ message: "Subcategory added", id: result.insertId });
    }
  });
});

module.exports = router;
