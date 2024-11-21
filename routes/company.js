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
const uploadDir = path.resolve(__dirname, "../companylogos");
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

// Endpoint to handle form submission and file upload
router.post("/company", upload.single("image"), (req, res) => {
  console.log("Received file:", req.file);
  console.log("Headers:", req.headers);
  console.log("Received body:", req.body);

  const {
    companyName,branch, addressLine1,addressLine2,contactPerson,
    stakeholderName,username,pincode,contactNumber,stakeholderDetail,
    category,state,priority,assignedStaff,subcategory,district,
    establishmentType, notificationAlert, password
  } = req.body;

  const logoimage = req.file ? req.file.filename : null;

  const sql = `INSERT INTO company_master 
    (companyname,category,subcategory,state,district,branch,
    address1,address2,pincode,contactperson,contactnumber,
    priority,establishment,staff,notification,stakeholdername,stackholderemail,username,password,logo) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?)`;

  db.query(
    sql,
    [
    companyName,category,subcategory,state,district,branch,addressLine1,addressLine2,pincode,
    contactPerson,contactNumber,priority,establishmentType,assignedStaff,notificationAlert,
    stakeholderName,stakeholderDetail,username,password,logoimage],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ message: "Failed to save compliance record." });
      }
      res.status(200).json({ message: "Compliance record saved successfully." });
    }
  );
});

router.get('/company', (req, res) => {
  db.query('SELECT * FROM company_master WHERE is_active = 1', (err, results) => {
    if (err) {
      res.status(500).send("Database query error");
    } else {
      res.json(results);
    }
  });
});



// Serve uploaded files statically
app.use("/companylogos", express.static(uploadDir));

module.exports = router;
