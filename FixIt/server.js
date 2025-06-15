// All your requires
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Savaujak',
    database: 'service_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('✅ Connected to MySQL');
});

// Create tables
db.query(`
    CREATE TABLE IF NOT EXISTS providers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255)
    )
`);

db.query(`
    CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image VARCHAR(255),
        name VARCHAR(100),
        mobile VARCHAR(15),
        location VARCHAR(100),
        price VARCHAR(50),
        skill VARCHAR(100),
        experience VARCHAR(50),
        availability VARCHAR(50),
        bio TEXT,
        provider_id INT,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
    )
`);

// SIGNUP
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO providers (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        (err, result) => {
            if (err) {
                console.error('❌ Signup error:', err);
                return res.status(500).json({ error: 'Email already used' });
            }
            res.json({ success: true, message: 'Signup successful' });
        }
    );
});

// LOGIN
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM providers WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            res.json({ success: true, providerId: user.id, email: user.email, name: user.name });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// ADD SERVICE
app.post('/api/services', upload.single('image'), (req, res) => {
    const { name, mobile, location, price, skill, experience, availability, bio, providerId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const serviceData = { name, mobile, location, price, skill, experience, availability, bio, image, provider_id: providerId };

    db.query('INSERT INTO services SET ?', serviceData, (err, result) => {
        if (err) {
            console.error('❌ Insert error:', err);
            return res.status(500).json({ error: 'Database insert failed' });
        }
        res.json({ success: true, id: result.insertId });
    });
});

// UPDATE SERVICE
app.put('/api/services/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { name, mobile, location, price, skill, experience, availability, bio, providerId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const updateFields = [
        'name = ?', 'mobile = ?', 'location = ?', 'price = ?',
        'skill = ?', 'experience = ?', 'availability = ?', 'bio = ?'
    ];
    const values = [name, mobile, location, price, skill, experience, availability, bio];

    if (image) {
        updateFields.push('image = ?');
        values.push(image);
    }

    values.push(id, providerId);

    db.query(
        `UPDATE services SET ${updateFields.join(', ')} WHERE id = ? AND provider_id = ?`,
        values,
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Update failed' });
            res.json({ success: true });
        }
    );
});

// GET ALL SERVICES (for customers to browse)
app.get('/api/services', (req, res) => {
    db.query('SELECT * FROM services', (err, results) => {
        if (err) return res.status(500).json({ error: 'Fetch failed' });
        res.json(results);
    });
});

// GET SERVICE BY ID (for editing)
app.get('/api/services/:id', (req, res) => {
    db.query('SELECT * FROM services WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching service' });
        if (results.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(results[0]);
    });
});

// GET SERVICES BY PROVIDER ID (for dashboard)
app.get('/api/my-services/:providerId', (req, res) => {
    const providerId = req.params.providerId;

    if (!providerId) return res.status(400).json({ error: 'Provider ID missing' });

    db.query('SELECT * FROM services WHERE provider_id = ?', [providerId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching your services' });
        res.json(results);
    });
});

// DELETE SERVICE
app.delete('/api/services/:id', (req, res) => {
    db.query('DELETE FROM services WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Delete failed' });
        res.json({ success: true });
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
