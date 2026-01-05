/**
 * Bullet Generation Route
 * POST /api/generate-bullets
 * Generates ATS-friendly resume bullets for missing skills
 */

const express = require('express');
const { generateBullets } = require('../services/bulletGenerator');

const router = express.Router();

/**
 * POST /api/generate-bullets
 * Generate resume bullet points for missing skills
 * 
 * Request body:
 * {
 *   "missingSkills": ["AWS", "Docker", "Kubernetes"]
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { missingSkills } = req.body;

    // Validate input
    if (!missingSkills || !Array.isArray(missingSkills)) {
      return res.status(400).json({
        success: false,
        error: 'missingSkills must be an array of skill names',
      });
    }

    // Filter out empty strings and validate
    const validSkills = missingSkills
      .filter((skill) => typeof skill === 'string' && skill.trim().length > 0)
      .map((skill) => skill.trim());

    if (validSkills.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one valid skill',
      });
    }

    // Limit the number of skills to prevent abuse
    const limitedSkills = validSkills.slice(0, 10);

    // Generate bullets for each skill
    const bullets = generateBullets(limitedSkills);

    res.json({
      success: true,
      bullets,
      skillsProcessed: limitedSkills.length,
    });
  } catch (error) {
    console.error('Bullet generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate bullet points',
    });
  }
});

module.exports = router;
