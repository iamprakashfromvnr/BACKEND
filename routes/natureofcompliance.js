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
  const {nature} = req.body;
  const query = 'INSERT INTO natureofcompliance (nature) VALUES (?)';
  db.query(query, [nature], (err, result) => {
    if (err) {
      res.status(500).send("Database insertion error",err);
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

module.exports = router;
