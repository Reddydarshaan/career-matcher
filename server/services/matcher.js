/**
 * Resume Matcher Service
 * Uses TF-IDF and keyword matching to compare resume against job description
 */

const natural = require('natural');
const TfIdf = natural.TfIdf;

// Common technical skills and keywords to look for
const SKILL_KEYWORDS = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab',
  
  // Frontend
  'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'html', 'css',
  'sass', 'tailwind', 'bootstrap', 'jquery', 'redux', 'graphql',
  
  // Backend
  'node.js', 'express', 'django', 'flask', 'spring', 'rails', 'laravel',
  'fastapi', 'nest.js', 'asp.net',
  
  // Databases
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
  'cassandra', 'dynamodb', 'firebase', 'supabase',
  
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible',
  'jenkins', 'gitlab', 'github', 'ci/cd', 'devops',
  
  // Other Technologies
  'git', 'linux', 'rest', 'api', 'microservices', 'agile', 'scrum',
  'jira', 'machine learning', 'ai', 'data science', 'testing',
];

/**
 * Extract keywords from text using TF-IDF
 * @param {string} text - Input text
 * @returns {string[]} - Array of significant keywords
 */
function extractKeywords(text) {
  const tfidf = new TfIdf();
  tfidf.addDocument(text.toLowerCase());
  
  const keywords = new Set();
  
  // Add terms with high TF-IDF scores
  tfidf.listTerms(0).forEach((item) => {
    if (item.tfidf > 0.1 && item.term.length > 2) {
      keywords.add(item.term);
    }
  });
  
  // Also check for known skill keywords in the text
  const textLower = text.toLowerCase();
  SKILL_KEYWORDS.forEach((skill) => {
    if (textLower.includes(skill.toLowerCase())) {
      keywords.add(skill.toLowerCase());
    }
  });
  
  return Array.from(keywords);
}

/**
 * Match resume text against job description
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobText - Job description text
 * @returns {Object} - Match results with score and keyword analysis
 */
function matchResumeToJob(resumeText, jobText) {
  const resumeLower = resumeText.toLowerCase();
  const jobKeywords = extractKeywords(jobText);
  
  const matchedKeywords = [];
  const missingKeywords = [];
  
  // Check each job keyword against the resume
  jobKeywords.forEach((keyword) => {
    if (resumeLower.includes(keyword)) {
      matchedKeywords.push(capitalizeFirst(keyword));
    } else {
      missingKeywords.push(capitalizeFirst(keyword));
    }
  });
  
  // Calculate match score
  const totalKeywords = jobKeywords.length;
  const score = totalKeywords > 0
    ? Math.round((matchedKeywords.length / totalKeywords) * 100)
    : 0;
  
  return {
    score,
    matchedKeywords,
    missingKeywords,
    totalKeywords,
  };
}

/**
 * Capitalize first letter of a string
 * @param {string} str - Input string
 * @returns {string} - Capitalized string
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  extractKeywords,
  matchResumeToJob,
  SKILL_KEYWORDS,
};
