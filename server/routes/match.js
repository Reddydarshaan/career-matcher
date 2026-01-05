const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { matchResumeToJob } = require("../services/matcher");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/match
 * Accepts:
 * - resume (PDF/TXT file)
 * - jobText (string)
 */
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    let resumeText = "";
    const { jobText } = req.body;

    // Validate job description
    if (!jobText || typeof jobText !== "string") {
      return res.status(400).json({
        success: false,
        error: "Job description text is required",
      });
    }

    // Extract resume text
    if (req.file) {
      if (req.file.mimetype === "application/pdf") {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf-8");
      }
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: "Resume content is too short or invalid",
      });
    }

    // Perform matching
    const result = matchResumeToJob(resumeText, jobText);

    res.json({
      success: true,
      score: result.score,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      totalKeywords: result.totalKeywords,
    });
  } catch (error) {
    console.error("Matching error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze resume match",
    });
  }
});

module.exports = router;
