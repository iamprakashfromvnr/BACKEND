// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const cors = require('cors');
// GET all natureofcompliance
const app =express();
app.use(cors());
app.use(express.json());
router.get('/natureofcompliance', (req, res) => {
  db.query('SELECT * FROM natureofcompliance WHERE is_active = 1', (err, results) => {
    if (err) {
      res.status(500).send("Database query error");
    } else {
      res.json(results);
    }
  });
});

// ADD a new natureofcompliance
router.post('/natureofcompliance', (req, res) => {
  const { nature } = req.body;
  const query = 'INSERT INTO natureofcompliance (nature) VALUES (?)';
  db.query(query, [nature], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Database insertion error", error: err });
    } else {
      res.json({ message: "Natureofcompliance added", id: result.insertId });
    }
  });
});

// Remove a natureofcompliance
router.delete('/natureofcompliance/:id', (req, res) => {
  const { id } = req.params;

  // SQL query to delete the item based on its ID
  const query = 'DELETE FROM natureofcompliance WHERE id = ?';

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

router.get('/natureofcompliancelist', (req, res) => {
  const id = req.query.id;
  if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
  }

  const query = 'SELECT * FROM natureofcompliance WHERE id = ?';
  db.query(query, [id], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database query failed' });
      }
      res.json(results);
  });
});

router.put('/natureofcompliance/:id', async (req, res) => {
  console.log("Data is Enter");
  const { id } = req.params;
  const { compliance } = req.body; // Get the category name from the request body

  try {
    // Update category by ID in the MySQL database
    const query = 'UPDATE natureofcompliance SET nature = ? WHERE id = ?';
    db.query(query, [compliance, id], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Nature of Compliance not found' });
      }

      res.json({ message: 'Nature of Compliance updated successfully' }); // Send success message
    });
  } catch (error) {
    console.error('Error updating Nature of Compliance:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
