# Credit-Based-Doc-Scanning-System

A self-contained document scanning and matching system with a built-in credit system. Users can upload documents, compare them against stored documents, and manage their credits.

## Features
- User registration and login.
- Daily 20 free scans per user (auto-reset at midnight).
- Admin approval for additional credit requests.
- Document similarity matching using a custom algorithm.
- Admin dashboard for analytics and credit management.

## Tech Stack
### Frontend : HTML, CSS, JavaScript.
### Backend : Node.js (Express).
### Database : Local JSON file (db.json).
### File Storage : Documents stored locally in backend/uploads/.

## Setup Instructions
### Install Dependencies :
##### bash
npm install
### Start the Server :
##### bash
node backend/server.js
##### Open the Frontend :
Open frontend/index.html in your browser.

### Testing
1. Register a user and log in.
2. Upload a plain text file to scan (uses 1 credit).
3. Request additional credits if needed (admin approval required).
4. Log in as an admin to approve/deny credit requests and view analytics.

### Folder Structure
document-scanner/
├── backend/         # Backend code and database
├── frontend/        # Frontend files (HTML, CSS, JS)
└── README.md        # This file

