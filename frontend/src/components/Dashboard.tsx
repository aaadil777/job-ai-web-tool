import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Briefcase, TrendingUp, Clock, CheckCircle2, Search, Sparkles } from "lucide-react";
import type { View } from "../App";

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    { label: "Applications Sent", value: "23", icon: Briefcase, change: "+5 this week" },
    { label: "Interviews Scheduled", value: "4", icon: Clock, change: "2 upcoming" },
    { label: "AI Matches", value: "47", icon: Sparkles, change: "12 new today" },
    { label: "Response Rate", value: "18%", icon: TrendingUp, change: "+3% vs last month" },
  ];

  const recentApplications = [
    { company: "TechCorp Inc.", position: "Senior Software Engineer", status: "Interview", date: "2 days ago", color: "bg-blue-500" },
    { company: "StartupXYZ", position: "Frontend Developer", status: "Applied", date: "3 days ago", color: "bg-yellow-500" },
    { company: "MegaSoft", position: "Full Stack Developer", status: "Rejected", date: "5 days ago", color: "bg-red-500" },
    { company: "InnovateLab", position: "React Developer", status: "Applied", date: "1 week ago", color: "bg-yellow-500" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Welcome back!</h1>
        <p className="text-muted-foreground">Here's your job search overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Application Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Application Progress</CardTitle>
            <CardDescription>Your journey to landing the perfect job</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Profile Completion</span>
                <span className="text-sm">85%</span>
              </div>
              <Progress value={85} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Resume Optimization</span>
                <span className="text-sm">92%</span>
              </div>
              <Progress value={92} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Application Goals (20/30)</span>
                <span className="text-sm">67%</span>
              </div>
              <Progress value={67} />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your job search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onNavigate("search")}
            >
              <Search className="w-4 h-4 mr-2" />
              Search for Jobs
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onNavigate("matches")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              View AI Matches
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onNavigate("resume")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Optimize Resume
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Track your latest job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((app, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${app.color} rounded-lg flex items-center justify-center text-white`}>
                    {app.company.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{app.position}</div>
                    <div className="text-sm text-muted-foreground">{app.company}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={app.status === "Interview" ? "default" : app.status === "Rejected" ? "destructive" : "secondary"}>
                    {app.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{app.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
