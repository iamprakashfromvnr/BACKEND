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

  router.post('/user',upload.single("userImage"),(req,res)=>{
    console.log("Received file:", req.file);
    console.log("Headers:", req.headers);
    console.log("Received body:", req.body);
    const {
        username, email, companyAccess, role, password, modulesAccess,
    } =req.body;
    
    const userImage = req.file ? req.file.filename : null;
    const sql = "INSERT INTO users (username,password,email,role,company,module,profilephoto) VALUES (?,?,?,?,?,?,?)"
    db.query(sql,[username,password,email,role,companyAccess,modulesAccess,userImage],(err, result) => {
          if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Failed to save compliance record." });
          }
          res.status(200).json({ message: "Compliance record saved successfully." });
        }
    );
  });

  router.get('/user', (req, res) => {
    db.query('SELECT users.*,role.role as role,company_master.companyname as company,modules.modulename as module from users LEFT JOIN role ON users.role = role.id LEFT JOIN modules ON users.module = modules.id LEFT JOIN company_master ON users.company = company_master.id', (err, results) => {
      if (err) {
        res.status(500).send("Database query error");
      } else {
        res.json(results);
      }
    });
  });
module.exports = router;
