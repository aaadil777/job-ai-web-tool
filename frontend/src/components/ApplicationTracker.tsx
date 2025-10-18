import { Card, CardContent } from "./ui/card";
import { Calendar, Building2, DollarSign, MapPin } from "lucide-react";

const applications = [
  {
    id: 1,
    company: "TechCorp Inc.",
    position: "Senior React Developer",
    appliedDate: "2025-10-05",
    salary: "$120k - $160k",
    location: "Remote",
  },
  {
    id: 2,
    company: "StartupXYZ",
    position: "Frontend Engineer",
    appliedDate: "2025-10-08",
    salary: "$100k - $140k",
    location: "San Francisco, CA",
  },
  {
    id: 3,
    company: "MegaSoft Solutions",
    position: "Full Stack Developer",
    appliedDate: "2025-10-01",
    salary: "$110k - $150k",
    location: "New York, NY",
  },
  {
    id: 4,
    company: "InnovateLab",
    position: "React Developer",
    appliedDate: "2025-10-03",
    salary: "$105k - $135k",
    location: "Remote",
  },
  {
    id: 5,
    company: "CloudNine Tech",
    position: "Senior Frontend Developer",
    appliedDate: "2025-09-28",
    salary: "$130k - $170k",
    location: "Austin, TX",
  },
  {
    id: 6,
    company: "DataDrive Solutions",
    position: "Full Stack Engineer",
    appliedDate: "2025-09-20",
    salary: "$125k - $155k",
    location: "Remote",
  },
];

export function ApplicationTracker() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1>Jobs You've Applied To</h1>
        <p className="text-muted-foreground">Track your applications in one place</p>
      </div>

      {/* Summary */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">You've applied to</p>
            <p className="text-5xl font-bold text-primary mb-2">{applications.length}</p>
            <p className="text-lg">jobs total</p>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="mb-1">{app.position}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{app.company}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Applied {app.appliedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{app.salary}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{app.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">No applications yet</h3>
            <p className="text-muted-foreground">
              Start applying to jobs and they'll show up here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
