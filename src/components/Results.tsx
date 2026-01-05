import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResultsProps {
  score: number; // kept for compatibility, NOT used
  matchedKeywords: string[];
  missingKeywords: string[];
  bullets: Record<string, string[]>;
  onReset: () => void;
}

/* =====================================================
   ✅ FINAL RESUME-CENTRIC WEIGHTED SCORE (CORRECT)
   ===================================================== */
function calculateWeightedScore(
  matchedKeywords: string[],
  missingKeywords: string[]
): number {
  const normalize = (arr: string[]) =>
    arr.map((k) => k.toLowerCase().trim());

  const matched = normalize(matchedKeywords);
  const missing = normalize(missingKeywords);

  // Filter out HR / noise words
  const isMeaningful = (k: string) => {
    if (k.length < 4) return false;
    if (k.split(" ").length === 1 && k.length < 6) return false;
    return true;
  };

  const meaningfulMatched = matched.filter(isMeaningful);
  const meaningfulMissing = missing.filter(isMeaningful);

  // Weight matched keywords (resume-focused)
  let matchedWeight = 0;
  meaningfulMatched.forEach((keyword) => {
    let weight = 1;
    if (keyword.split(" ").length > 1) weight = 2;
    matchedWeight += weight;
  });

  // Apply SOFT penalty for missing skills
  let missingPenalty = 0;
  meaningfulMissing.forEach((keyword) => {
    let penalty = 0.3;
    if (keyword.split(" ").length > 1) penalty = 0.5;
    missingPenalty += penalty;
  });

  if (matchedWeight === 0) return 0;

  const score = matchedWeight / (matchedWeight + missingPenalty);

  return Math.round(score * 100);
}

export function Results({
  score, // ignored
  matchedKeywords,
  missingKeywords,
  bullets,
  onReset,
}: ResultsProps) {
  const [copiedBullet, setCopiedBullet] = useState<string | null>(null);
  const [expandedSkills, setExpandedSkills] = useState<string[]>(
    Object.keys(bullets).slice(0, 2)
  );

  /* ✅ ACTUAL FIX IS HERE */
  const weightedScore = calculateWeightedScore(
    matchedKeywords,
    missingKeywords
  );

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedBullet(id);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const toggleSkill = (skill: string) => {
    setExpandedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const getScoreColor = () => {
    if (weightedScore >= 80) return "text-success";
    if (weightedScore >= 60) return "text-primary";
    if (weightedScore >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreMessage = () => {
    if (weightedScore >= 80)
      return "Excellent match! Your resume is well-aligned.";
    if (weightedScore >= 60)
      return "Good match! Some improvements could help.";
    if (weightedScore >= 40)
      return "Moderate match. Consider adding missing skills.";
    return "Low match. Significant improvements needed.";
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Score Card */}
      <div className="gradient-card rounded-2xl p-8 border border-border shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Match Score</h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-muted stroke-current"
                strokeWidth="8"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
              <circle
                className={cn(
                  "stroke-current transition-all duration-1000",
                  getScoreColor()
                )}
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
                style={{
                  strokeDasharray: `${2 * Math.PI * 42}`,
                  strokeDashoffset: `${
                    2 * Math.PI * 42 * (1 - weightedScore / 100)
                  }`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-4xl font-bold", getScoreColor())}>
                {weightedScore}%
              </span>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1 text-center md:text-left">
           <p className="text-xs text-muted-foreground mb-3">
            Score is based on resume–job description skill overlap with soft penalties for missing skills.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {matchedKeywords.length} matched
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-destructive" />
                {missingKeywords.length} missing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EVERYTHING BELOW IS UNCHANGED FROM YOUR ORIGINAL */}
      {/* Keywords Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h3 className="font-bold text-foreground">Matched Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1.5 bg-success/10 text-success border border-success/20 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No matching skills found
              </p>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-warning" />
            <h3 className="font-bold text-foreground">Skills to Add</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.length > 0 ? (
              missingKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1.5 bg-warning/10 text-warning-foreground border border-warning/20 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                Great! You have all the required skills
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Bullets */}
      {Object.keys(bullets).length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">
              Suggested Resume Bullets
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Add these ATS-friendly bullet points to showcase your experience with
            missing skills
          </p>

          <div className="space-y-4">
            {Object.entries(bullets).map(([skill, skillBullets]) => (
              <div
                key={skill}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSkill(skill)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground">{skill}</span>
                  {expandedSkills.includes(skill) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {expandedSkills.includes(skill) && (
                  <div className="p-4 space-y-3 bg-background">
                    {skillBullets.map((bullet, index) => {
                      const bulletId = `${skill}-${index}`;
                      return (
                        <div
                          key={bulletId}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg group"
                        >
                          <p className="flex-1 text-sm text-foreground leading-relaxed font-mono">
                            • {bullet}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={() =>
                              copyToClipboard(`• ${bullet}`, bulletId)
                            }
                          >
                            {copiedBullet === bulletId ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onReset}
      >
        <RotateCcw className="h-4 w-4" />
        Start New Analysis
      </Button>
    </div>
  );
}
