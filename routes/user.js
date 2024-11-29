const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const db = require("../config/db");

const router = express.Router();

// Middleware setup
const app = express();
app.use(cors());
app.use(express.json());

// Ensure the uploads directory exists
const uploadDir = path.resolve(__dirname, "../public/users");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to the uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Rename file with timestamp
  },
});

const upload = multer({ storage });
app.use("/uploads", express.static(uploadDir));

router.get('/role', (req, res) => {
    db.query('SELECT * FROM role WHERE is_active = 1', (err, results) => {
      if (err) {
        res.status(500).send("Database query error");
      } else {
        res.json(results);
      }
    });
  });

  router.get('/modules', (req, res) => {
    db.query('SELECT * FROM modules WHERE is_active = 1', (err, results) => {
      if (err) {
        res.status(500).send("Database query error");
      } else {
        res.json(results);
      }
    });
  });

  router.post('/user', upload.single('userImage'), (req, res) => {
    const { username, email, password, role, companyAccess, modulesAccess } = req.body;
    const userImage = req.file ? req.file.filename : null;
  
    // Step 1: Insert user into the `users` table
    const sql = `
      INSERT INTO users (username, password, email, role, profilephoto) 
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [username, password, email, role, userImage], (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ message: 'Failed to save user record.' });
      }
  
      const userId = result.insertId; // Get the ID of the newly created user
  
      // Step 2: Assign companies to user
      if (companyAccess && companyAccess.length > 0) {
        const companySql = `INSERT INTO user_company (user_id, company_id) VALUES (?,?)`;
  
        db.query(companySql, [userId,companyAccess], (err) => {
          if (err) {
            console.error('Company Assignment Error:', err);
            return res.status(500).json({ message: 'Failed to assign companies.' });
          }
        });
      }
  
      
  
      // Step 3: Assign modules to user
      if (modulesAccess && modulesAccess.length > 0) {
        const moduleSql = `INSERT INTO user_module_access (user_id, module_id) VALUES(?,?)`;
  
        db.query(moduleSql, [userId,modulesAccess], (err) => {
          if (err) {
            console.error('Module Assignment Error:', err);
            return res.status(500).json({ message: 'Failed to assign modules.' });
          }
        });
      }
  
      res.status(200).json({ message: 'User created successfully.' });
    });
  });

  router.get('/user', (req, res) => {
    db.query('SELECT users.*, role.role as role, company_master.companyname as companyname, user_company.company_id, user_module_access.module_id, modules.modulename as module FROM users LEFT JOIN role ON role.id = users.role LEFT JOIN user_company ON user_company.user_id = users.id LEFT JOIN company_master ON company_master.id = user_company.company_id LEFT JOIN user_module_access ON user_module_access.user_id = users.id LEFT JOIN modules ON modules.id = user_module_access.module_id;', (err, results) => {
      if (err) {
        res.status(500).send("Database query error");
      } else {
        res.json(results);
      }
    });
  });


  router.delete('/user/:id', (req, res) => {
    const { id } = req.params;
    console.log(id)
  
    // SQL query to delete the item based on its ID
    const query = 'DELETE FROM users WHERE id = ?';
  
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