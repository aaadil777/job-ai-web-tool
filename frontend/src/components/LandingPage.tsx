import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { 
  Search, 
  FileText, 
  Target,
  Bot,
  Briefcase
} from "lucide-react";
import { BullseyeLogo } from "./BullseyeLogo";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: FileText,
      title: "Resume Analyzer",
      description: "Upload your resume and get AI-powered feedback and suggestions.",
    },
    {
      icon: Search,
      title: "AI Job Matches",
      description: "Find jobs that match your skills and preferences with comprehensive filters.",
    },
    {
      icon: Target,
      title: "Resume Optimization",
      description: "Get tailored bullet points for each job description to improve your applications.",
    },
    {
      icon: Briefcase,
      title: "Application Tracking",
      description: "Keep track of all your job applications in one place.",
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Chat with an AI assistant for job search help and career guidance.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BullseyeLogo className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">JobHunt AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onGetStarted}>Login</Button>
            <Button onClick={onGetStarted}>Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Find Your Next Opportunity
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered job search tool to help you find jobs, optimize your resume for each application, and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted}>
              Sign Up
            </Button>
            <Button size="lg" variant="outline" onClick={onGetStarted}>
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-accent/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">Features</h2>
            <p className="text-lg text-muted-foreground">
              Tools to help you with your job search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl mb-6">
            Ready to get started?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onGetStarted}
            >
              Sign Up
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={onGetStarted}
            >
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BullseyeLogo className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">JobHunt AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 JobHunt AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
