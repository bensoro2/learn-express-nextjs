const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT
const path = require('path');
const multer = require('multer')

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'bb12345677',
    database: 'mycrudapi',
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// User registration
app.post('/api/register', async (req, res) => {
    const { email, name, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (email, name, password) VALUES (?, ?, ?)';
        
        db.query(query, [email, name, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error registering user.' });
            }
            res.status(201).json({ id: result.insertId, email, name });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error hashing password.' });
    }
});

// User login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = results[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

        // Return token and user info
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name 
            } 
        });
    });
});
// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Initialize express app

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });


// Error handling middleware
const handleError = (res, err) => {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
};

// CRUD routes

// Create
app.post('/api/items', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const image = req.file ? req.file.filename : null;

    const query = 'INSERT INTO items (title, description, image) VALUES (?, ?, ?)';
    db.query(query, [title, description, image], (err, result) => {
        if (err) return handleError(res, err);
        res.status(201).json({
            id: result.insertId,
            title,
            description,
            image,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    });
});

// Read
app.get('/api/items', (req, res) => {
    const query = 'SELECT * FROM items';
    db.query(query, (err, results) => {
        if (err) return handleError(res, err);
        res.json(results);
    });
});

// Update
app.put('/api/items/:id', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    let image;

    if (req.file) {
        // ถ้ามีการอัปโหลดรูปภาพใหม่
        image = req.file.filename;
    } else if (req.body.existingImage) {
        // ส่งชื่อไฟล์รูปภาพเดิม
        image = req.body.existingImage;
    } else {
        // ถ้าไม่มีรูปภาพใหม่หรือเดิม ใช้ค่า null
        image = null;
    }

    const query = 'UPDATE items SET title = ?, description = ?, image = ? WHERE id = ?';
    db.query(query, [title, description, image, req.params.id], (err, result) => {
        if (err) return handleError(res, err);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({
            id: req.params.id,
            title,
            description,
            image,
            updatedAt: new Date(),
        });
    });
});

// Delete
app.delete('/api/items/:id', (req, res) => {
  const query = 'DELETE FROM items WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
      if (err) return handleError(res, err);
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Item not found' });
      }
      res.status(200).json({ message: 'Item deleted successfully' }); // Send a success message
  });
});

app.get('/api/items/search', (req, res) => {
    const { query } = req.query; // รับค่าค้นหาจาก query string
    const sqlQuery = `SELECT * FROM items WHERE title LIKE ? OR description LIKE ?`;
    const searchTerm = `%${query}%`; // ใช้ wildcard สำหรับการค้นหา

    db.query(sqlQuery, [searchTerm, searchTerm], (err, results) => {
        if (err) return handleError(res, err);
        res.json(results);
    });
});

// Start the server
const PORT = 3001; // Change this line to use port 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
