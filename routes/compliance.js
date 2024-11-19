const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const router = express.Router();
const db = require('../config/db');

// Setup express app
const app = express();
app.use(cors());
app.use(express.json());

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to the uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  },
});

const upload = multer({ storage: storage });

// Endpoint to handle form submission and file upload
router.post("/compliance", upload.single("documentPdf"), (req, res) => {
  console.log("The file is ", req.file); // Log file info for debugging

  const {
    natureOfCompliance,
    activity,
    typeOfAct,
    applicationLaborAct,
    dueDate,
    section,
    remarks,
    nameOfForm,
    state,
    applicability,
    frequencyOfCompliance,
    priorityType,
  } = req.body; // Use req.body directly, no need for 'formData' object

  const documentPdf = req.file ? req.file.filename : null; // Getting filename from the file upload
  console.log("Uploaded file:", documentPdf);

  const sql = `INSERT INTO compliance_master 
    (natureOfCompliance, activity, typeOfAct, applicationLaborAct, dueDate, section, remarks, nameOfForm, state, applicability, frequencyOfCompliance, priorityType, documentPdf) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [
      natureOfCompliance,
      activity,
      typeOfAct,
      applicationLaborAct,
      dueDate,
      section,
      remarks,
      nameOfForm,
      state,
      applicability,
      frequencyOfCompliance,
      priorityType,
      documentPdf,
    ],
    (err, result) => {
      if (err) {
        console.error('Database Error: ', err);
        return res.status(500).json({ message: "Failed to save compliance record." });
      }
      res.status(200).json({ message: "Compliance record saved successfully." });
    }
  );
});

// Serve uploaded files statically
app.use("/uploads", express.static(uploadDir));

module.exports = router;
