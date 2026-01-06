import { useState } from "react";
import { FileSearch, Zap, Target, Shield } from "lucide-react";
import { UploadForm } from "@/components/UploadForm";
import { Results } from "@/components/Results";
import { Loader } from "@/components/Loader";
import { analyzeResume, generateBullets } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { MatchResponse } from "@/services/api";

type AnalysisState = "idle" | "matching" | "generating" | "complete";

interface AnalysisResult extends MatchResponse {
  bullets: Record<string, string[]>;
}

const features = [
  {
    icon: FileSearch,
    title: "Smart Parsing",
    description: "Extract text from PDF and TXT resumes instantly",
  },
  {
    icon: Target,
    title: "Keyword Matching",
    description: "TF-IDF powered analysis finds skill gaps",
  },
  {
    icon: Zap,
    title: "ATS Bullets",
    description: "Generate optimized resume bullet points",
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "Your data never leaves your device",
  },
];

export default function Index() {
  const [state, setState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (formData: FormData) => {
    try {
      setLoading(true);
      setState("matching");

      // Step 1: Resume ↔ Job Matching (backend handles parsing)
      const matchResult = await analyzeResume(formData);

      // Step 2: Generate bullets (if missing skills exist)
      setState("generating");
      let bullets: Record<string, string[]> = {};

      if (matchResult.missingKeywords.length > 0) {
        const bulletsResult = await generateBullets(
          matchResult.missingKeywords
        );
        bullets = bulletsResult.bullets;
      }

      // Final result
      setResult({
        ...matchResult,
        bullets,
      });
      setState("complete");

      toast({
        title: "Analysis Complete",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      setState("idle");
      toast({
        title: "Analysis Failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
  };

  const getLoaderText = () => {
    switch (state) {
      case "matching":
        return "Analyzing resume match...";
      case "generating":
        return "Generating ATS-friendly bullets...";
      default:
        return "Processing...";
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-primary shadow-glow">
            <FileSearch className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              AI Resume Matcher
            </h1>
            <p className="text-xs text-muted-foreground">
              Smart Resume & Job Analysis
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        {state === "idle" && !result && (
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Match Your Resume to{" "}
              <span className="text-gradient">Any Job</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Upload your resume, paste a job description, and instantly see how
              well you match—plus get ATS-optimized resume bullets.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-card/50 border border-border/50 rounded-xl p-4 text-center animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex p-2 rounded-lg bg-primary/10 mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {state === "idle" && !result && (
            <div className="bg-card border border-border rounded-2xl shadow-lg p-6">
              <UploadForm onAnalyze={handleAnalyze} isLoading={loading} />
            </div>
          )}

          {(state === "matching" || state === "generating") && (
            <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
              <Loader text={getLoaderText()} size="lg" />
            </div>
          )}

          {state === "complete" && result && (
            <Results
              score={result.score}
              matchedKeywords={result.matchedKeywords}
              missingKeywords={result.missingKeywords}
              bullets={result.bullets}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Built with React • Node.js • NLP • No data stored
        </div>
      </footer>
    </div>
  );
}
