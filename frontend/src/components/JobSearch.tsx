import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Search, MapPin, Briefcase, DollarSign, Clock, Bookmark, ExternalLink } from "lucide-react";

const mockJobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $160k",
    posted: "2 days ago",
    description: "We're looking for an experienced React developer to join our growing team. You'll work on cutting-edge web applications using React, TypeScript, and modern tooling.",
    requirements: ["5+ years React experience", "TypeScript proficiency", "Experience with Next.js", "Strong CSS skills"],
    tags: ["React", "TypeScript", "Remote"],
  },
  {
    id: 2,
    title: "Frontend Engineer",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100k - $140k",
    posted: "1 week ago",
    description: "Join our fast-paced startup building the future of e-commerce. We need a talented frontend engineer who loves creating beautiful user experiences.",
    requirements: ["3+ years frontend experience", "React or Vue.js", "Responsive design", "API integration"],
    tags: ["JavaScript", "React", "CSS"],
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "MegaSoft Solutions",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110k - $150k",
    posted: "3 days ago",
    description: "Build scalable applications from front to back. We're seeking a versatile developer comfortable with both client and server-side development.",
    requirements: ["Full stack experience", "Node.js & React", "Database design", "AWS or Azure"],
    tags: ["Node.js", "React", "AWS", "Remote"],
  },
  {
    id: 4,
    title: "UI/UX Engineer",
    company: "DesignLab",
    location: "Remote",
    type: "Contract",
    salary: "$90k - $120k",
    posted: "5 days ago",
    description: "Bridge the gap between design and development. Create pixel-perfect interfaces and delightful user experiences.",
    requirements: ["Strong CSS/HTML", "Design systems", "Figma proficiency", "Animation experience"],
    tags: ["CSS", "Figma", "Animation", "Remote"],
  },
  {
    id: 5,
    title: "JavaScript Developer",
    company: "CloudFirst Inc.",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$105k - $135k",
    posted: "1 day ago",
    description: "Work with modern JavaScript frameworks and cloud technologies. Help us build the next generation of SaaS products.",
    requirements: ["Strong JavaScript", "Framework experience", "Cloud platforms", "Agile methodology"],
    tags: ["JavaScript", "Vue.js", "GCP"],
  },
  {
    id: 6,
    title: "React Native Developer",
    company: "MobileApp Co.",
    location: "Los Angeles, CA",
    type: "Full-time",
    salary: "$115k - $145k",
    posted: "4 days ago",
    description: "Create amazing mobile experiences for iOS and Android using React Native. Join a team passionate about mobile-first development.",
    requirements: ["React Native experience", "Mobile development", "iOS/Android deployment", "Performance optimization"],
    tags: ["React Native", "Mobile", "TypeScript"],
  },
];

export function JobSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(mockJobs[0]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Job Search</h1>
        <p className="text-muted-foreground">Find your next opportunity</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fulltime">Full-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="parttime">Part-time</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Listings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{mockJobs.length} jobs found</p>
          </div>
          
          {mockJobs.map((job) => (
            <Card
              key={job.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedJob(job)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-1">{job.title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Posted {job.posted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Job Details */}
        <div className="lg:sticky lg:top-8 h-fit">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-2">{selectedJob.title}</CardTitle>
                  <CardDescription className="text-base">{selectedJob.company}</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{selectedJob.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{selectedJob.salary}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {selectedJob.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>

              <div>
                <h3 className="mb-2">About the Role</h3>
                <p className="text-muted-foreground">{selectedJob.description}</p>
              </div>

              <div>
                <h3 className="mb-2">Requirements</h3>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex-1">Apply Now</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to {selectedJob.title}</DialogTitle>
                      <DialogDescription>
                        Your application will be sent to {selectedJob.company}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Application submitted successfully! We'll track this in your Applications page.
                      </p>
                      <Button className="w-full">View Applications</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
