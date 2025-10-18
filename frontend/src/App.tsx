import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { Sidebar } from "./components/JobHuntSidebar";
import { AIResumeAnalyzer } from "./components/AIResumeAnalyzer";
import { JobMatches } from "./components/JobMatches";
import { SavedJobs } from "./components/SavedJobs";
import { ApplicationTracker } from "./components/ApplicationTracker";
import { Account } from "./components/Account";
import { AIChatbot } from "./components/AIChatbot";

export type View = "resume" | "matches" | "saved" | "applications" | "account";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>("resume");

  const handleGetStarted = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  const renderView = () => {
    switch (currentView) {
      case "resume":
        return <AIResumeAnalyzer />;
      case "matches":
        return <JobMatches />;
      case "saved":
        return <SavedJobs />;
      case "applications":
        return <ApplicationTracker />;
      case "account":
        return <Account />;
      default:
        return <AIResumeAnalyzer />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
      <AIChatbot />
    </div>
  );
}
