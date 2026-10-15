const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded assets from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    architecture: 'Decoupled Client-Server',
    phase: 'Frontend Presentation & Decoupled Service Layer',
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for SPA-like client navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` LUXURY APPAREL E-COMMERCE SERVER RUNNING`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Environment: Node.js + Express.js`);
  console.log(` Architecture: Decoupled (Frontend first, SQLite3 backend ready)`);
  console.log(`====================================================`);
});
