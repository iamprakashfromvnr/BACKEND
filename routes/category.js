// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');


// ADD a new category
router.post('/category', (req, res) => {
  console.log('Data is Entered')
  const { category } = req.body;
  console.log(category);

  if (!category) {
      return res.status(400).json({ error: "Category field is required." });
  }

  const query = "INSERT INTO category (category_name) VALUES (?)";
  db.query(query, [category], (err, result) => {
      if (err) {
          console.error("Database insertion error:", err);
          return res.status(500).json({ error: "Database insertion error", details: err.message });
      }

      res.status(201).json({ message: "Category created successfully!", categoryId: result.insertId });
  });
});

// Remove a category
router.delete('/category/:id', (req, res) => {
  const { id } = req.params;

  // SQL query to delete the item based on its ID
  const query = 'DELETE FROM category WHERE id = ?';

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


router.get('/category', (req, res) => {
  db.query('SELECT * FROM category WHERE is_active = 1', (err, results) => {
    if (err) {
      res.status(500).send("Database query error");
    } else {
      res.json(results);
    }
  });
});

router.get('/categorylist', (req, res) => {
  const id = req.query.id;
  if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
  }

  const query = 'SELECT * FROM category WHERE id = ?';
  db.query(query, [id], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database query failed' });
      }
      res.json(results);
  });
});


router.put('/category/:id', async (req, res) => {
  const { id } = req.params;
  const { category } = req.body; // Get the category name from the request body

  try {
    // Update category by ID in the MySQL database
    const query = 'UPDATE category SET category_name = ? WHERE id = ?';
    db.query(query, [category, id], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json({ message: 'Category updated successfully' }); // Send success message
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
