import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Upload, FileText, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

export function AIResumeAnalyzer() {
  const [analyzed, setAnalyzed] = useState(false);

  const handleFileUpload = () => {
    // Simulate file upload and analysis
    setTimeout(() => setAnalyzed(true), 1000);
  };

  const overallScore = 78;

  const topSuggestions = [
    { text: "Add numbers to show your impact (e.g., 'Increased sales by 30%')", icon: AlertTriangle, color: "text-orange-500" },
    { text: "Include important job keywords like 'React', 'TypeScript', 'Leadership'", icon: Sparkles, color: "text-blue-500" },
    { text: "Add a brief summary at the top of your resume", icon: Sparkles, color: "text-blue-500" },
  ];

  const beforeAfter = {
    before: "Developed web applications using React",
    after: "Built 5+ web applications using React and TypeScript, improving page speed by 40%",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1>Step 1: Upload Your Resume</h1>
        <p className="text-muted-foreground">Let AI help you improve your resume</p>
      </div>

      {!analyzed ? (
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Upload Your Resume</CardTitle>
            <CardDescription>
              We'll check your resume and give you tips to make it better
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="mb-4">Drop your resume here or click below</p>
              <Button onClick={handleFileUpload} size="lg">Choose File</Button>
              <p className="text-sm text-muted-foreground mt-4">
                PDF or Word document
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Your Resume Score</CardTitle>
              <CardDescription>Here's how your resume looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">{overallScore}</div>
                  <Badge variant="secondary">Good! You're on the right track</Badge>
                </div>
              </div>
              <Progress value={overallScore} className="h-3 mb-4" />
              <p className="text-muted-foreground text-center">
                Follow the tips below to make your resume even better
              </p>
            </CardContent>
          </Card>

          {/* Top Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Top 3 Things to Fix</CardTitle>
              <CardDescription>Start with these to improve your resume quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-accent">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm">
                      {index + 1}
                    </div>
                    <p className="flex-1">{suggestion.text}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Example */}
          <Card>
            <CardHeader>
              <CardTitle>See the Difference</CardTitle>
              <CardDescription>Here's an example of a better way to write your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-sm font-medium">Before (Too basic):</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p>{beforeAfter.before}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm font-medium">After (Much better!):</p>
                </div>
                <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
                  <p>{beforeAfter.after}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button className="flex-1" size="lg">
              Continue to Find Jobs
            </Button>
            <Button variant="outline" onClick={() => setAnalyzed(false)}>
              Upload Different Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
