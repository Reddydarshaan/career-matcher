/**
 * API Service
 * Handles all communication with the backend API
 */

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* =======================
   RESPONSE TYPES
======================= */

export interface MatchResponse {
  success: boolean;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords?: number;
  error?: string;
}

export interface GenerateBulletsResponse {
  bullets: Record<string, string[]>;
}

/* =======================
   MATCH RESUME WITH JOB
======================= */
/**
 * Upload resume (PDF/TXT) + job description
 */
export async function analyzeResume(
  formData: FormData
): Promise<MatchResponse> {
  const response = await fetch(`${BASE_URL}/match`, {
    method: "POST",
    body: formData, // IMPORTANT: FormData only
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || "Failed to analyze resume");
  }

  return response.json();
}

/* =======================
   GENERATE BULLET POINTS
======================= */
/**
 * Generate ATS-friendly resume bullets
 */
export async function generateBullets(
  missingSkills: string[]
): Promise<GenerateBulletsResponse> {
  const response = await fetch(`${BASE_URL}/generate-bullets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ missingSkills }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate bullets");
  }

  return response.json();
}
