import { Loader2 } from "lucide-react";

interface LoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Loader({ text = "Analyzing...", size = "md" }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <Loader2 className={`${sizeClasses[size]} text-primary animate-spin relative z-10`} />
      </div>
      <p className="text-muted-foreground font-medium animate-pulse">{text}</p>
    </div>
  );
}
