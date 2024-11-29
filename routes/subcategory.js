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
  db.query('SELECT subcategory.*,category.category_name FROM subcategory JOIN category ON subcategory.category_id = category.id WHERE subcategory.is_active = 1', (err, results) => {
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

router.get('/subcategorylist', (req, res) => {
  const id = req.query.id;
  if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
  }

  const query = 'SELECT * FROM subcategory WHERE id = ?';
  db.query(query, [id], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database query failed' });
      }
      res.json(results);
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


router.put('/subcategory/:id', async (req, res) => {
  const { id } = req.params;
  const { category_id,subcategory_name } = req.body; // Get the category name from the request body

  try {
    // Update category by ID in the MySQL database
    const query = 'UPDATE subcategory SET category_id = ?, subcategory_name=? WHERE id = ?';
    db.query(query, [category_id,subcategory_name,id], (error, results) => {
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
