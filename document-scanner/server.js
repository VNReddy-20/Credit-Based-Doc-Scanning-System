const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('frontend'));

// File storage configuration
const upload = multer({ dest: 'backend/uploads/' });

// Load local JSON database
let db = {
    users: [],
    documents: [],
    creditRequests: [],
};

// Save DB to file
function saveDB() {
    fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2));
}

// Load DB from file
if (fs.existsSync(path.join(__dirname, 'db.json'))) {
    db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json')));
}

// Helper functions
const { authenticateUser, hashPassword } = require('./utils/auth');
const { deductCredit, resetCredits, requestCredits } = require('./utils/creditSystem');
const { findSimilarDocuments } = require('./utils/textMatching');
const { generateAnalytics } = require('./utils/analytics');

// Routes

// User Registration
app.post('/auth/register', async (req, res) => {
    const { username, password, role = 'user' } = req.body;
    if (db.users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = { username, password: hashedPassword, role, credits: 20, scans: [] };
    db.users.push(newUser);
    saveDB();
    res.status(201).json({ message: 'User registered successfully' });
});

// User Login
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ username, role: user.role }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
});

// Get User Profile
app.get('/user/profile', authenticateUser, (req, res) => {
    const user = db.users.find(u => u.username === req.user.username);
    res.json({ username: user.username, credits: user.credits, scans: user.scans });
});

// Upload Document for Scanning
app.post('/scan', authenticateUser, upload.single('file'), async (req, res) => {
    const user = db.users.find(u => u.username === req.user.username);
    if (user.credits <= 0) {
        return res.status(400).json({ message: 'Insufficient credits' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    deductCredit(user);
    const similarDocs = findSimilarDocuments(fileContent, db.documents);
    db.documents.push({ id: Date.now(), content: fileContent, owner: user.username });
    user.scans.push({ id: Date.now(), content: fileContent });
    saveDB();
    res.json({ message: 'Scan successful', matches: similarDocs });
});

// Request Additional Credits
app.post('/credits/request', authenticateUser, (req, res) => {
    const user = db.users.find(u => u.username === req.user.username);
    db.creditRequests.push({ username: user.username, status: 'pending' });
    saveDB();
    res.json({ message: 'Credit request submitted' });
});

// Admin Approve/Deny Credit Requests
app.post('/admin/credits/:action', authenticateUser, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    const { action } = req.params;
    const { username } = req.body;
    const request = db.creditRequests.find(r => r.username === username && r.status === 'pending');
    if (!request) {
        return res.status(400).json({ message: 'Invalid request' });
    }
    request.status = action;
    if (action === 'approve') {
        const user = db.users.find(u => u.username === username);
        user.credits += 20;
    }
    saveDB();
    res.json({ message: `Credit request ${action}d` });
});

// Admin Analytics
app.get('/admin/analytics', authenticateUser, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    const analytics = generateAnalytics(db);
    res.json(analytics);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
