import { Sparkles, FileText, Bookmark, ListChecks, User } from "lucide-react";
import type { View } from "../App";
import { BullseyeLogo } from "./BullseyeLogo";

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: "resume" as View, label: "Resume Upload", icon: FileText },
    { id: "matches" as View, label: "AI Job Matches", icon: Sparkles },
    { id: "saved" as View, label: "Saved Jobs", icon: Bookmark },
    { id: "applications" as View, label: "Applied Jobs", icon: ListChecks },
    { id: "account" as View, label: "Account", icon: User },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BullseyeLogo className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">JobHunt AI</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="bg-accent rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">Pro Tip</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload your resume to get AI-powered job recommendations!
          </p>
        </div>
      </div>
    </div>
  );
}
