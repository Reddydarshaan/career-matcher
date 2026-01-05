/**
 * Resume Parser Service
 * Handles extraction of text from PDF and TXT files
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Extract text from a resume file
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Extracted text content
 */
async function extractText(file) {
  const buffer = fs.readFileSync(file.path);
  
  // Handle different file types
  if (file.mimetype === 'application/pdf') {
    return extractFromPdf(buffer);
  } else if (file.mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type. Please upload PDF or TXT files.');
  }
}

/**
 * Extract text from PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('Could not extract text from PDF. The file may be scanned or image-based.');
    }
    
    // Clean up the extracted text
    return cleanText(data.text);
  } catch (error) {
    if (error.message.includes('Could not extract')) {
      throw error;
    }
    throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF.');
  }
}

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might interfere with matching
    .replace(/[^\w\s.,;:!?@#$%&*()\-+=\/\\'"]/g, '')
    // Trim whitespace
    .trim();
}

module.exports = {
  extractText,
  extractFromPdf,
  cleanText,
};
