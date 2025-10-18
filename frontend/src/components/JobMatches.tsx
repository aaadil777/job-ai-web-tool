import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Sparkles, TrendingUp, MapPin, Briefcase, DollarSign, Heart, X, Eye, FileText, Copy, CheckCircle2, Filter, SlidersHorizontal, Clock, Bookmark } from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  employmentType: "Full-time" | "Part-time" | "Contract";
  shift: "Day" | "Night" | "Flexible";
  salary: string;
  salaryMin: number;
  salaryMax: number;
  matchScore: number;
  matchReasons: string[];
  requiredSkills: string[];
  niceToHave: string[];
  tags: string[];
  description?: string;
  descriptionBullets: string[];
  resumeBullets?: string[];
  isRemote: boolean;
  industry: string;
}

const allJobs: Job[] = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    employmentType: "Full-time",
    shift: "Day",
    salary: "$120k - $160k",
    salaryMin: 120000,
    salaryMax: 160000,
    matchScore: 95,
    matchReasons: [
      "Strong React & TypeScript skills match",
      "5+ years experience requirement met"
    ],
    requiredSkills: ["React", "TypeScript", "Next.js"],
    niceToHave: ["GraphQL", "AWS"],
    tags: ["Remote", "Health Insurance", "401k"],
    isRemote: true,
    industry: "Technology",
    description: "Build scalable web applications using React, TypeScript, and Next.js. Lead frontend architecture decisions and mentor junior developers.",
    descriptionBullets: [
      "Build modern web applications using React and TypeScript",
      "Lead frontend architecture and technical decisions",
      "Mentor junior developers through code reviews",
      "Collaborate with design and backend teams",
      "Ship high-quality code with tests"
    ],
    resumeBullets: [
      "Architected and implemented 15+ responsive web applications using React and TypeScript, improving user engagement by 40% and reducing page load times by 35%",
      "Led migration of legacy codebase to Next.js, resulting in 50% faster initial page loads and improved SEO rankings across 200+ pages",
      "Mentored team of 5 junior developers through code reviews and pair programming sessions, accelerating their proficiency in React best practices and modern JavaScript patterns",
      "Spearheaded adoption of TypeScript across frontend stack, reducing runtime errors by 60% and improving code maintainability scores by 45%",
      "Optimized component rendering strategies and implemented code-splitting techniques, reducing bundle size by 30% and improving Core Web Vitals scores",
    ],
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "InnovateLab",
    location: "New York, NY",
    type: "Full-time",
    employmentType: "Full-time",
    shift: "Flexible",
    salary: "$110k - $150k",
    salaryMin: 110000,
    salaryMax: 150000,
    matchScore: 88,
    matchReasons: [
      "Full stack experience matches",
      "JavaScript expertise aligned"
    ],
    requiredSkills: ["React", "Node.js", "MongoDB"],
    niceToHave: ["Docker", "Kubernetes"],
    tags: ["Equity", "Flexible Hours", "Remote"],
    isRemote: true,
    industry: "Technology",
    description: "Work across the full stack to build innovative products. Design APIs, implement features, and ship code rapidly in a startup environment.",
    descriptionBullets: [
      "Build full-stack features using React and Node.js",
      "Design and implement RESTful APIs",
      "Work with MongoDB databases and data modeling",
      "Ship features rapidly in a startup environment",
      "Collaborate with product and design teams"
    ],
    resumeBullets: [
      "Developed and deployed 10+ full-stack features using React and Node.js, directly contributing to 25% increase in monthly active users",
      "Designed and implemented RESTful APIs serving 100K+ daily requests with 99.9% uptime, handling user authentication, data processing, and real-time updates",
      "Built scalable MongoDB database schemas supporting 500K+ user records with optimized indexing strategies that reduced query times by 70%",
      "Collaborated cross-functionally with product and design teams in fast-paced startup environment, shipping features 40% faster than industry average",
      "Implemented automated testing suite achieving 85% code coverage, reducing production bugs by 50% and improving deployment confidence",
    ],
  },
  {
    id: 3,
    title: "Frontend Architect",
    company: "CloudFirst Inc.",
    location: "Remote",
    type: "Full-time",
    employmentType: "Full-time",
    shift: "Day",
    salary: "$130k - $170k",
    salaryMin: 130000,
    salaryMax: 170000,
    matchScore: 82,
    matchReasons: [
      "Advanced React skills match",
      "Architecture experience preferred"
    ],
    requiredSkills: ["React", "System Design", "Performance"],
    niceToHave: ["Team Leadership", "Mentoring"],
    tags: ["Remote", "Stock Options", "Unlimited PTO"],
    isRemote: true,
    industry: "Technology",
    description: "Define frontend architecture standards and lead technical decisions. Focus on performance, scalability, and developer experience.",
    descriptionBullets: [
      "Define frontend architecture and technical standards",
      "Lead performance optimization initiatives",
      "Implement scalable design patterns and best practices",
      "Mentor engineers and conduct code reviews",
      "Build tools to improve developer experience"
    ],
    resumeBullets: [
      "Designed and documented comprehensive frontend architecture for enterprise SaaS platform serving 1M+ users, establishing standards adopted across 8 engineering teams",
      "Led performance optimization initiatives that improved Core Web Vitals scores by 65%, reducing bounce rates by 30% and increasing conversion rates by 20%",
      "Evaluated and implemented micro-frontend architecture using Module Federation, enabling 4 teams to deploy independently while maintaining consistent UX",
      "Established frontend testing strategy and CI/CD pipelines, reducing deployment time from 2 hours to 15 minutes while maintaining zero-downtime releases",
      "Conducted technical interviews and architecture reviews, growing engineering team from 5 to 20 members while maintaining high code quality standards",
    ],
  },
  {
    id: 4,
    title: "JavaScript Developer",
    company: "StartupXYZ",
    location: "Austin, TX",
    type: "Full-time",
    employmentType: "Part-time",
    shift: "Day",
    salary: "$100k - $130k",
    salaryMin: 100000,
    salaryMax: 130000,
    matchScore: 76,
    matchReasons: [
      "JavaScript proficiency matches",
      "Modern framework experience"
    ],
    requiredSkills: ["JavaScript", "Vue.js", "CSS"],
    niceToHave: ["Testing", "CI/CD"],
    tags: ["Hybrid", "Learning Budget", "Health Insurance"],
    isRemote: false,
    industry: "Technology",
    description: "Build dynamic web applications with Vue.js. Participate in agile sprints and contribute to product development from ideation to deployment.",
    descriptionBullets: [
      "Build interactive features using Vue.js and modern JavaScript",
      "Create responsive UI components with CSS3",
      "Participate in agile sprints and standups",
      "Contribute to product from ideation to deployment",
      "Write unit tests and maintain code quality"
    ],
    resumeBullets: [
      "Developed 20+ interactive features using Vue.js and modern JavaScript (ES6+), contributing to product that achieved 150K+ active users",
      "Implemented responsive UI components with CSS3 and SASS following BEM methodology, ensuring pixel-perfect designs across desktop and mobile devices",
      "Participated in bi-weekly agile sprints, consistently delivering features on time and collaborating with cross-functional teams of 8+ members",
      "Created comprehensive unit and integration tests using Jest and Vue Test Utils, achieving 80% code coverage and reducing regression bugs by 45%",
      "Integrated CI/CD pipelines using GitHub Actions for automated testing and deployment, reducing release cycle time from 2 days to 2 hours",
    ],
  },
  {
    id: 5,
    title: "Night Shift Support Engineer",
    company: "TechSupport247",
    location: "Remote",
    type: "Full-time",
    employmentType: "Full-time",
    shift: "Night",
    salary: "$85k - $110k",
    salaryMin: 85000,
    salaryMax: 110000,
    matchScore: 70,
    matchReasons: [
      "Technical support experience",
      "Remote work preference"
    ],
    requiredSkills: ["JavaScript", "Troubleshooting", "Customer Service"],
    niceToHave: ["React", "Node.js"],
    tags: ["Remote", "Night Differential", "Health Insurance"],
    isRemote: true,
    industry: "Technology",
    description: "Provide technical support to enterprise customers during night hours. Troubleshoot issues and escalate critical bugs to engineering.",
    descriptionBullets: [
      "Respond to customer technical issues during night shift",
      "Troubleshoot and debug application problems",
      "Document issues and solutions in knowledge base",
      "Escalate critical bugs to engineering team",
      "Work with customers across different time zones"
    ],
    resumeBullets: [
      "Resolved 200+ technical support tickets monthly with 95% customer satisfaction rating, troubleshooting JavaScript and React application issues",
      "Collaborated with engineering teams to deliver 12 major product releases, maintaining 98% on-time delivery rate while meeting quality standards",
      "Conducted user research with 200+ customers, translating insights into product roadmap that increased customer satisfaction scores by 40%",
      "Analyzed product metrics using SQL and analytics tools, identifying opportunities that generated $2M in additional annual revenue",
      "Managed cross-functional teams of 15+ members across design, engineering, and marketing to launch new payment processing features",
    ],
  },
  {
    id: 6,
    title: "Senior Software Engineer",
    company: "HealthTech Solutions",
    location: "Seattle, WA",
    type: "Full-time",
    employmentType: "Full-time",
    shift: "Day",
    salary: "$135k - $175k",
    salaryMin: 135000,
    salaryMax: 175000,
    matchScore: 91,
    matchReasons: [
      "Strong technical skills match",
      "Healthcare tech experience valued"
    ],
    requiredSkills: ["Python", "AWS", "Microservices"],
    niceToHave: ["Healthcare Experience", "HIPAA Knowledge"],
    tags: ["Remote", "Stock Options", "Health Insurance"],
    isRemote: true,
    industry: "Healthcare",
    description: "Build secure, scalable healthcare applications. Design microservices architecture and ensure HIPAA compliance across all systems.",
    descriptionBullets: [
      "Build HIPAA-compliant microservices for healthcare data",
      "Design scalable AWS infrastructure and architecture",
      "Ensure security and compliance across all systems",
      "Work with healthcare providers on API integrations",
      "Mentor engineers on secure coding practices"
    ],
    resumeBullets: [
      "Architected HIPAA-compliant microservices platform handling 2M+ patient records with 99.99% uptime and zero security breaches",
      "Implemented AWS infrastructure using Terraform and Kubernetes, reducing cloud costs by 40% while improving system reliability",
      "Led technical design for healthcare data pipeline processing 10TB+ daily, ensuring sub-second query performance for critical patient information",
      "Mentored 8 engineers on best practices for secure coding and HIPAA compliance, establishing security standards across 3 product teams",
      "Collaborated with medical professionals to design intuitive APIs, improving integration time for healthcare providers by 60%",
    ],
  },
  {
    id: 7,
    title: "Data Scientist",
    company: "E-commerce Giants",
    location: "Remote",
    type: "Full-time",
    employmentType: "Full-time",
    shift: "Flexible",
    salary: "$125k - $165k",
    salaryMin: 125000,
    salaryMax: 165000,
    matchScore: 73,
    matchReasons: [
      "Analytics skills match",
      "Python proficiency aligned"
    ],
    requiredSkills: ["Python", "Machine Learning", "SQL"],
    niceToHave: ["Deep Learning", "A/B Testing"],
    tags: ["Remote", "Learning Budget", "401k"],
    isRemote: true,
    industry: "E-commerce",
    description: "Build ML models to optimize product recommendations and pricing. Work with large datasets to drive business decisions.",
    descriptionBullets: [
      "Build ML models for product recommendations and pricing",
      "Analyze large datasets to drive business decisions",
      "Design and execute A/B tests on user behavior",
      "Create analytics dashboards using SQL",
      "Work with engineering to deploy models to production"
    ],
    resumeBullets: [
      "Developed recommendation engine using collaborative filtering and deep learning, increasing product discovery by 45% and revenue by $5M annually",
      "Built dynamic pricing models analyzing 100M+ transactions, optimizing margins while maintaining competitive positioning across 50K+ SKUs",
      "Designed and executed 30+ A/B tests analyzing user behavior, leading to 25% improvement in conversion rates across key customer segments",
      "Created SQL-based analytics dashboards processing 10TB+ daily data, enabling real-time business insights for executive decision-making",
      "Trained and mentored 4 junior data scientists on ML best practices, establishing standardized workflows that improved model deployment time by 50%",
    ],
  },
  {
    id: 8,
    title: "UX Designer",
    company: "DesignFirst Studio",
    location: "Los Angeles, CA",
    type: "Full-time",
    employmentType: "Full-time",
    shift: "Day",
    salary: "$95k - $125k",
    salaryMin: 95000,
    salaryMax: 125000,
    matchScore: 70,
    matchReasons: [
      "Design thinking approach",
      "User research experience"
    ],
    requiredSkills: ["Figma", "User Research", "Prototyping"],
    niceToHave: ["HTML/CSS", "Animation"],
    tags: ["Hybrid", "Creative Team", "Health Insurance"],
    isRemote: false,
    industry: "Technology",
    description: "Design beautiful, intuitive user experiences. Conduct user research and create high-fidelity prototypes for web and mobile apps.",
    descriptionBullets: [
      "Design user experiences for web and mobile apps",
      "Conduct user research and usability testing",
      "Create high-fidelity prototypes in Figma",
      "Work with product and engineering teams",
      "Build and maintain design systems"
    ],
    resumeBullets: [
      "Led UX design for mobile app redesign serving 300K+ users, increasing user satisfaction scores from 3.2 to 4.6 stars through research-driven iterations",
      "Conducted user research sessions with 150+ participants, identifying pain points that informed design decisions and improved task completion rates by 55%",
      "Created comprehensive design system in Figma used by 4 product teams, reducing design-to-development time by 40% while ensuring brand consistency",
      "Designed and prototyped 25+ user flows for web and mobile applications, collaborating with engineering teams to ensure pixel-perfect implementation",
      "Established UX metrics framework tracking 15+ KPIs, demonstrating 35% improvement in user engagement after implementing design recommendations",
    ],
  },
];

export function JobMatches() {
  const [copiedBullet, setCopiedBullet] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  
  // Filter states
  const [locationFilter, setLocationFilter] = useState("");
  const [salaryRange, setSalaryRange] = useState([0, 200000]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [industryFilter, setIndustryFilter] = useState("all");
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<"all" | "Full-time" | "Part-time" | "Contract">("all");
  const [shiftFilter, setShiftFilter] = useState<"all" | "Day" | "Night" | "Flexible">("all");

  const getMatchColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-blue-500";
    if (score >= 70) return "text-orange-500";
    return "text-yellow-500";
  };

  const getMatchLabel = (score: number) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 80) return "Great Match";
    if (score >= 70) return "Good Match";
    return "Potential Match";
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(id);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Filter jobs based on criteria
  const filteredJobs = allJobs.filter((job) => {
    // Location filter
    if (locationFilter && !job.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }

    // Salary range filter
    if (job.salaryMax < salaryRange[0] || job.salaryMin > salaryRange[1]) {
      return false;
    }

    // Remote filter
    if (remoteOnly && !job.isRemote) {
      return false;
    }

    // Industry filter
    if (industryFilter !== "all" && job.industry !== industryFilter) {
      return false;
    }

    // Job title filter
    if (jobTitleFilter && !job.title.toLowerCase().includes(jobTitleFilter.toLowerCase())) {
      return false;
    }

    // Employment type filter
    if (employmentTypeFilter !== "all" && job.employmentType !== employmentTypeFilter) {
      return false;
    }

    // Shift filter
    if (shiftFilter !== "all" && job.shift !== shiftFilter) {
      return false;
    }

    return true;
  });

  const uniqueIndustries = Array.from(new Set(allJobs.map(job => job.industry)));

  const clearFilters = () => {
    setLocationFilter("");
    setSalaryRange([0, 200000]);
    setRemoteOnly(false);
    setIndustryFilter("all");
    setJobTitleFilter("");
    setEmploymentTypeFilter("all");
    setShiftFilter("all");
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1>Step 2: Find Jobs You'll Love</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
        </div>
        <p className="text-muted-foreground">
          These jobs match your skills and preferences
        </p>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Jobs
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
            <CardDescription>Find exactly what you're looking for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Job Title Filter */}
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. React Developer"
                  value={jobTitleFilter}
                  onChange={(e) => setJobTitleFilter(e.target.value)}
                />
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco, Remote"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>

              {/* Industry Filter */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {uniqueIndustries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employment Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select value={employmentTypeFilter} onValueChange={(value: any) => setEmploymentTypeFilter(value)}>
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shift Filter */}
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select value={shiftFilter} onValueChange={(value: any) => setShiftFilter(value)}>
                  <SelectTrigger id="shift">
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    <SelectItem value="Day">Day Shift</SelectItem>
                    <SelectItem value="Night">Night Shift</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary Range Filter */}
            <div className="space-y-3 md:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between">
                <Label>How much do you want to earn?</Label>
                <span className="text-sm font-medium">
                  ${(salaryRange[0] / 1000).toFixed(0)}k - ${(salaryRange[1] / 1000).toFixed(0)}k per year
                </span>
              </div>
              <Slider
                min={0}
                max={200000}
                step={10000}
                value={salaryRange}
                onValueChange={setSalaryRange}
                className="w-full"
              />
            </div>

            {/* Remote Only Toggle */}
            <div className="flex items-center justify-between md:col-span-2 lg:col-span-3 p-4 rounded-lg bg-accent">
              <div className="space-y-0.5">
                <Label>Work from Home</Label>
                <p className="text-sm text-muted-foreground">Only show remote jobs</p>
              </div>
              <Switch checked={remoteOnly} onCheckedChange={setRemoteOnly} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Jobs Summary */}
      {savedJobs.length > 0 && (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                <p>You have <span className="font-medium text-primary">{savedJobs.length}</span> saved {savedJobs.length === 1 ? 'job' : 'jobs'}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSavedJobs([])}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Summary */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">We found</p>
            <p className="text-5xl font-bold text-primary mb-2">{filteredJobs.length}</p>
            <p className="text-lg">jobs that match you</p>
          </div>
        </CardContent>
      </Card>

      {/* Job Matches */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              Try changing your filters to see more jobs
            </p>
            <Button onClick={clearFilters} size="lg">Show All Jobs</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job) => {
            const isSaved = savedJobs.includes(job.id);
            return (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle>{job.title}</CardTitle>
                    <Badge variant="secondary" className={getMatchColor(job.matchScore)}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      {job.matchScore}% Match
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{job.company}</CardDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{job.employmentType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{job.shift} Shift</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Match Score Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Match Quality</span>
                  <span className={`text-sm font-medium ${getMatchColor(job.matchScore)}`}>
                    {getMatchLabel(job.matchScore)}
                  </span>
                </div>
                <Progress value={job.matchScore} className="h-2" />
              </div>

              {/* Job Description Bullets */}
              <div>
                <h4 className="mb-3">What you'll do:</h4>
                <ul className="space-y-2">
                  {job.descriptionBullets?.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why This Match */}
              <div>
                <h4 className="mb-3">Why we picked this for you:</h4>
                <div className="space-y-2">
                  {job.matchReasons.slice(0, 2).map((reason, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Skills they want:</p>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Edit Resume for This Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Improve Your Resume for {job.title}
                      </DialogTitle>
                      <DialogDescription>
                        Add these bullet points to your resume to better match this job at {job.company}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* What the job needs */}
                      <div className="bg-accent/50 p-4 rounded-lg">
                        <h4 className="mb-3 flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          What They're Looking For
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {job.descriptionBullets?.slice(0, 3).map((bullet, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <span className="text-muted-foreground">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      {/* AI Generated Bullets */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <h4>Add These to Your Resume</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          These bullet points highlight skills that match what {job.company} is looking for. Click any bullet to copy it.
                        </p>
                        
                        <div className="space-y-3">
                          {job.resumeBullets?.map((bullet, index) => {
                            const bulletId = `${job.id}-${index}`;
                            const isCopied = copiedBullet === bulletId;
                            
                            return (
                              <div
                                key={index}
                                className="group relative p-4 rounded-lg border border-border hover:border-primary/50 transition-colors bg-card"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                                  </div>
                                  <p className="flex-1 text-sm leading-relaxed pr-8">{bullet}</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                    onClick={() => copyToClipboard(bullet, bulletId)}
                                  >
                                    {isCopied ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <Separator />

                      {/* Tips */}
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <h4 className="mb-2">💡 Pro Tips</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Copy the bullets that best match your experience</li>
                          <li>• Adjust the numbers and details to match your actual work</li>
                          <li>• Put the most relevant bullets at the top of your resume</li>
                        </ul>
                      </div>
                    </div>


                  </DialogContent>
                </Dialog>
                
                <Button className="flex-1">
                  Apply Now
                </Button>
                <Button 
                  variant={isSaved ? "default" : "outline"} 
                  size="icon"
                  onClick={() => toggleSaveJob(job.id)}
                  className={isSaved ? "bg-primary text-primary-foreground" : ""}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
