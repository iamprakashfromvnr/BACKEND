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
const uploadDir = path.resolve(__dirname, "../uploads");
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

// Endpoint to handle form submission and file upload
router.post("/compliance", upload.single("documentPdf"), (req, res) => {
  console.log("Received file:", req.file);
  console.log("Headers:", req.headers);
  console.log("Received body:", req.body);

  const {
    natureOfCompliance,
    activity,
    typeOfAct,
    applicationLaborAct,
    dueDate,
    calendartype,
    section,
    score,
    nameOfForm,
    state,
    applicability,
    frequencyOfCompliance,
    priorityType,
  } = req.body;

  const documentPdf = req.file ? req.file.filename : null;

  const sql = `INSERT INTO compliance_master 
    (natureOfCompliance, activity, typeOfAct, applicationLaborAct, dueDate,calendartype,section, score, nameOfForm, state, applicability, frequencyOfCompliance, priorityType, documentPdf) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

  db.query(
    sql,
    [
      natureOfCompliance,
      activity,
      typeOfAct,
      applicationLaborAct,
      dueDate,
      calendartype,
      section,
      score,
      nameOfForm,
      state,
      applicability,
      frequencyOfCompliance,
      priorityType,
      documentPdf,
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

router.get('/compliance', (req, res) => {
  db.query('SELECT compliance_master.*, natureofcompliance.nature as natureOfCompliance FROM compliance_master LEFT JOIN natureofcompliance ON natureofcompliance.id = compliance_master.natureOfCompliance WHERE compliance_master.is_active = 1;', (err, results) => {
    if (err) {
      res.status(500).send("Database query error");
    } else {
      res.json(results);
    }
  });
});

router.delete('/compliance/:id', (req, res) => {
  const { id } = req.params;

  // SQL query to delete the item based on its ID
  const query = 'DELETE FROM compliance_master WHERE id = ?';

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


router.get('/compliancefilling', (req, res) => {
  db.query('SELECT cm.*, cpm.*, s.statename, u.username AS staff_name, u.email AS staff_email FROM company_master cm CROSS JOIN compliance_master cpm LEFT JOIN states s ON cpm.state = s.id LEFT JOIN user_company uc ON cm.id = uc.company_id LEFT JOIN users u ON uc.user_id = u.id ORDER BY cm.id, cpm.id;', (err, results) => {
    if (err) {
      res.status(500).send("Database query error");
    } else {
      res.json(results);
    }
  });
});





// Serve uploaded files statically
app.use("/uploads", express.static(uploadDir));

module.exports = router;
