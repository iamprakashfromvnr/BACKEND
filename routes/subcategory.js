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

router.get('/subcategories', (req, res) => {
  db.query('SELECT * FROM subcategory WHERE is_active = 1', (err, results) => {
    if (err) {
      res.status(500).send("Database query error");
    } else {
      res.json(results);
    }
  });
});

// ADD a new category
router.post('/subcategory', (req, res) => {
  const { subCategory, category_id } = req.body;
  console.log(subCategory, category_id);

  const query = 'INSERT INTO subcategory (subcategory_name, category_id) VALUES (?, ?)';
  db.query(query, [subCategory, category_id], (err, result) => {
    if (err) {
      // Use res.status to set the HTTP status and send the error message in the body
      return res.status(500).json({ error: 'Database insertion error', details: err.message });
    } else {
      return res.status(200).json({ message: "Subcategory added", id: result.insertId });
    }
  });
});

router.delete('/subcategory/:id', (req, res) => {
  const { id } = req.params;

  // SQL query to delete the item based on its ID
  const query = 'DELETE FROM subcategory WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting item', error: err });
    }

    if (result.affectedRows === 0) {
      // If no rows were affected, that means no item was found with the given ID
      return res.status(404).json({ message: 'Item not found' });
    }

    // Return a success message with the result of the deletion
    res.status(200).json({ message: 'Item deleted successfully', deletedItemId: id });
  });
});

module.exports = router;
