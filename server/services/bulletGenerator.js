/**
 * Bullet Point Generator Service
 * Generates ATS-friendly resume bullets for missing skills
 */

// Templates for generating resume bullets
// {skill} will be replaced with the actual skill name
const BULLET_TEMPLATES = [
  'Developed and deployed {skill}-based solutions to improve system performance and reliability',
  'Implemented {skill} best practices to streamline development workflows and reduce deployment time by 30%',
  'Collaborated with cross-functional teams to integrate {skill} into existing infrastructure',
  'Built scalable applications leveraging {skill} to handle high-traffic production workloads',
  'Designed and maintained {skill} architecture following industry standards and security protocols',
  'Led initiatives to adopt {skill} technologies, resulting in improved team productivity',
  'Created comprehensive documentation and training materials for {skill} implementations',
  'Optimized application performance using {skill}, achieving significant improvements in response times',
];

// Skill-specific templates for more tailored suggestions
const SKILL_SPECIFIC_TEMPLATES = {
  aws: [
    'Architected and deployed cloud infrastructure on AWS, reducing operational costs by 25%',
    'Managed AWS services including EC2, S3, Lambda, and RDS for production environments',
    'Implemented AWS security best practices including IAM policies and VPC configurations',
    'Automated infrastructure provisioning using AWS CloudFormation and Terraform',
  ],
  docker: [
    'Containerized applications using Docker, enabling consistent deployments across environments',
    'Created optimized Dockerfiles reducing image sizes by 40% and improving build times',
    'Managed Docker Compose configurations for local development and testing environments',
    'Implemented Docker-based CI/CD pipelines for automated testing and deployment',
  ],
  kubernetes: [
    'Orchestrated containerized applications using Kubernetes in production environments',
    'Configured Kubernetes deployments, services, and ingress controllers for microservices',
    'Implemented Kubernetes autoscaling to handle variable workloads efficiently',
    'Managed Kubernetes clusters ensuring high availability and fault tolerance',
  ],
  python: [
    'Developed Python applications for data processing and automation workflows',
    'Built RESTful APIs using Python frameworks such as Flask and FastAPI',
    'Created Python scripts for ETL processes and data pipeline automation',
    'Implemented Python-based testing frameworks achieving 90%+ code coverage',
  ],
  react: [
    'Built responsive web applications using React and modern JavaScript practices',
    'Implemented state management solutions using Redux and Context API',
    'Created reusable React component libraries improving development efficiency',
    'Optimized React application performance through code splitting and lazy loading',
  ],
  'node.js': [
    'Developed scalable backend services using Node.js and Express framework',
    'Built RESTful APIs with Node.js handling thousands of concurrent requests',
    'Implemented real-time features using Node.js WebSocket connections',
    'Created Node.js microservices following event-driven architecture patterns',
  ],
};

/**
 * Generate ATS-friendly bullet points for missing skills
 * @param {string[]} missingSkills - Array of missing skill keywords
 * @returns {Object} - Object mapping skills to arrays of bullet points
 */
function generateBullets(missingSkills) {
  const bullets = {};
  
  missingSkills.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    
    // Check for skill-specific templates first
    if (SKILL_SPECIFIC_TEMPLATES[skillLower]) {
      bullets[skill] = SKILL_SPECIFIC_TEMPLATES[skillLower];
    } else {
      // Use generic templates with skill name substitution
      bullets[skill] = BULLET_TEMPLATES
        .slice(0, 4) // Return first 4 templates
        .map((template) => template.replace(/{skill}/g, skill));
    }
  });
  
  return bullets;
}

/**
 * Get a single random bullet for a skill
 * @param {string} skill - Skill name
 * @returns {string} - A random bullet point
 */
function getRandomBullet(skill) {
  const skillLower = skill.toLowerCase();
  const templates = SKILL_SPECIFIC_TEMPLATES[skillLower] || BULLET_TEMPLATES;
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex].replace(/{skill}/g, skill);
}

module.exports = {
  generateBullets,
  getRandomBullet,
  BULLET_TEMPLATES,
  SKILL_SPECIFIC_TEMPLATES,
};
