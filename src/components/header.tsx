import { Target } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="container mx-auto flex items-center gap-3 h-16">
        <Target className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-headline font-bold text-foreground">
          Aim Assist Analyzer
        </h1>
      </div>
    </header>
  );
}
