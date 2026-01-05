/**
 * Resume Parsing Route
 * POST /api/parse-resume
 * Accepts PDF or TXT files and extracts text content
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractText } = require('../services/parser');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter to accept only PDF and TXT
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and TXT files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * POST /api/parse-resume
 * Upload and parse a resume file
 */
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a PDF or TXT file.',
      });
    }

    // Extract text from the uploaded file
    const text = await extractText(req.file);

    // Clean up the uploaded file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    // Return the extracted text
    res.json({
      success: true,
      text,
      filename: req.file.originalname,
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }

    console.error('Resume parsing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to parse resume',
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.',
      });
    }
  }
  
  res.status(400).json({
    success: false,
    error: error.message || 'File upload failed',
  });
});

module.exports = router;
