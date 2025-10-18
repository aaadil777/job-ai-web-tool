import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Bookmark,
  ExternalLink,
  Trash2
} from "lucide-react";

const savedJobsData = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechVision Inc.",
    location: "Remote",
    salary: "$140k - $180k",
    type: "Full Time",
    match: 95,
    postedDate: "2 days ago",
    savedDate: "Today",
    description: "We're looking for an experienced React developer to join our growing team...",
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "CloudScale Systems",
    location: "San Francisco, CA",
    salary: "$130k - $170k",
    type: "Full Time",
    match: 92,
    postedDate: "1 week ago",
    savedDate: "Yesterday",
    description: "Join our team building cutting-edge cloud infrastructure solutions...",
  },
  {
    id: 3,
    title: "Frontend Developer",
    company: "DesignHub",
    location: "New York, NY",
    salary: "$110k - $150k",
    type: "Full Time",
    match: 88,
    postedDate: "3 days ago",
    savedDate: "2 days ago",
    description: "Help us create beautiful, user-friendly web applications...",
  },
];

export function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState(savedJobsData);

  const handleRemove = (id: number) => {
    setSavedJobs(savedJobs.filter(job => job.id !== id));
  };

  const getMatchColor = (match: number) => {
    if (match >= 90) return "text-green-600 dark:text-green-400";
    if (match >= 80) return "text-blue-600 dark:text-blue-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1>Saved Jobs</h1>
        <p className="text-muted-foreground">Jobs you've bookmarked for later</p>
      </div>

      {/* Summary */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">You have saved</p>
            <p className="text-5xl font-bold text-primary mb-2">{savedJobs.length}</p>
            <p className="text-lg">{savedJobs.length === 1 ? 'job' : 'jobs'} for later</p>
          </div>
        </CardContent>
      </Card>

      {/* Saved Jobs List */}
      {savedJobs.length > 0 ? (
        <div className="grid gap-6">
          {savedJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{job.title}</CardTitle>
                      <Badge variant="secondary" className={getMatchColor(job.match)}>
                        {job.match}% Match
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {job.company}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(job.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{job.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Posted {job.postedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Saved {job.savedDate}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Job Details
                  </Button>
                  <Button variant="outline">Apply Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">No saved jobs yet</h3>
            <p className="text-muted-foreground mb-4">
              Save jobs from the AI Job Matches tab to view them here later
            </p>
            <Button>Browse Jobs</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
