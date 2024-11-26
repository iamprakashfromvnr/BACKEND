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
const uploadDir = path.resolve(__dirname, "../branchlogos");
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

router.get('/branchlist', (req, res) => {
  const id = req.query.company_id;
  console.log(id);
  if (!id) {
      return res.status(400).json({ error: 'branach ID is required' });
  }

  const query = 'SELECT branch_master.*, company_master.companyname as companyname FROM branch_master INNER JOIN company_master ON branch_master.company_id = company_master.id WHERE company_id = ?';
  db.query(query, [id], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database query failed' });
      }
      res.json(results);
  });
});


router.post("/branch", upload.single("companyImage"), (req, res) => {
    console.log("Received file:", req.file);
    console.log("Headers:", req.headers);
    console.log("Received body:", req.body);
  
    const {
      company,branch, addressLine1,addressLine2,contactPerson,
      stakeholderName,username,pincode,contactNumber,stakeholderDetail,
      category,state,priority,assignedStaff,subcategory,district,
      establishmentType, notificationAlert, password
    } = req.body;
  
    const logoimage = req.file ? req.file.filename : null;
  
    const sql = `INSERT INTO branch_master 
      (company_id,category,subcategory,state,district,branch,
      address1,address2,pincode,contactperson,contactdetails,
      priority,establishment,staff,notification,stakeholdername,stakeholderdetail,username,password,logo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?)`;
  
    db.query(
      sql,
      [company,category,subcategory,state,district,branch,addressLine1,addressLine2,pincode,contactPerson,contactNumber,
        priority,establishmentType,assignedStaff,notificationAlert,stakeholderName,stakeholderDetail,username,password,logoimage
      ],
      (err, result) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ message: "Failed to save compliance record." });
        }
        res.status(200).json({ message: "Compliance record saved successfully." });
      }
    );
  });

  router.delete('/branch/:id', (req, res) => {
    const { id } = req.params;
  
    // SQL query to delete the item based on its ID
    const query = 'DELETE FROM branch_master WHERE id = ?';
  
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

//


module.exports = router;
