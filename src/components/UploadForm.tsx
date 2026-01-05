import { useState, useCallback } from "react";
import { Upload, FileText, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface UploadFormProps {
  onAnalyze: (formData: FormData) => void;
  isLoading: boolean;
}

export function UploadForm({ onAnalyze, isLoading }: UploadFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ["application/pdf", "text/plain"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or TXT file");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setResumeFile(file);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setResumeFile(file);
      }
    }
  };

  const handleSubmit = () => {
    if (!resumeFile) {
      setError("Please upload your resume");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobText", jobDescription);

    onAnalyze(formData);
  };

  return (
    <div className="space-y-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      {/* Resume Upload */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Upload Your Resume
        </label>

        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer",
            dragActive
              ? "border-primary bg-accent/50 scale-[1.01]"
              : resumeFile
              ? "border-success bg-success/5"
              : "border-border hover:border-primary/50 hover:bg-accent/30"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("resume-upload")?.click()}
        >
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center gap-3 text-center">
            {resumeFile ? (
              <>
                <div className="p-3 rounded-full bg-success/10">
                  <FileText className="h-8 w-8 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {resumeFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(resumeFile.size / 1024).toFixed(1)} KB • Click to replace
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF and TXT files (max 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Job Description
        </label>

        <Textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[200px] resize-none bg-card border-2 border-border focus:border-primary/50 rounded-xl p-4"
        />

        <p className="text-xs text-muted-foreground">
          Tip: Include the full job description for better matching accuracy
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Analyze Button */}
      <Button
        variant="default"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        <Sparkles className="h-5 w-5" />
        Analyze Match
      </Button>
    </div>
  );
}
