const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Controllers
const { 
  generateImage,
  generateVideo,
  editImage,
  extendImage,
  batchGenerate,
  getGenerations,
  getGenerationById,
  deleteGeneration
} = require('../controllers/generationController');

// Validation middleware
const validateGenerationRequest = (req, res, next) => {
  const { prompt, model, negative_prompt } = req.body;
  
  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  if (prompt.length > 5000) {
    return res.status(400).json({ error: 'Prompt too long (max 5000 characters)' });
  }
  
  next();
};

// Routes
router.post('/image', validateGenerationRequest, generateImage);
router.post('/video', validateGenerationRequest, generateVideo);
router.post('/edit', upload.single('image'), editImage);
router.post('/extend', upload.single('image'), extendImage);
router.post('/batch', validateGenerationRequest, batchGenerate);
router.get('/history', getGenerations);
router.get('/history/:id', getGenerationById);
router.delete('/history/:id', deleteGeneration);

// Webhook for async processing
router.post('/webhook/:service', (req, res) => {
  const { service } = req.params;
  const data = req.body;
  
  // Handle webhook from AI services
  console.log(`Webhook received from ${service}:`, data);
  
  // Process webhook data
  // This would update generation status in database
  // and notify client via WebSocket
  
  res.json({ received: true });
});

module.exports = router;