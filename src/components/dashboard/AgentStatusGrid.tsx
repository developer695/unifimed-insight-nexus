import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: number;
  name: string;
  status: "active" | "idle" | "error" | "warning";
  lastRun: string;
  successRate: number;
}

const agents: Agent[] = [
  { id: 0, name: "Voice Engine", status: "active", lastRun: "2 min ago", successRate: 98 },
  { id: 1, name: "Contact Intelligence", status: "active", lastRun: "5 min ago", successRate: 95 },
  { id: 2, name: "Outreach", status: "active", lastRun: "1 min ago", successRate: 97 },
  { id: 3, name: "Scheduling & Read.AI", status: "idle", lastRun: "15 min ago", successRate: 92 },
  { id: 4, name: "SEO Keywords", status: "active", lastRun: "3 min ago", successRate: 99 },
  { id: 5, name: "Content Engine", status: "warning", lastRun: "8 min ago", successRate: 88 },
  { id: 6, name: "Google Ads", status: "active", lastRun: "4 min ago", successRate: 94 },
  { id: 7, name: "Ad Optimization", status: "active", lastRun: "6 min ago", successRate: 96 },
  { id: 8, name: "Retargeting", status: "idle", lastRun: "20 min ago", successRate: 93 },
  { id: 9, name: "Analytics & Reporting", status: "active", lastRun: "1 min ago", successRate: 100 },
  { id: 10, name: "Meeting Insights", status: "active", lastRun: "10 min ago", successRate: 91 },
  { id: 11, name: "Compliance", status: "warning", lastRun: "12 min ago", successRate: 85 },
  { id: 12, name: "Website Traffic", status: "active", lastRun: "2 min ago", successRate: 98 },
  { id: 13, name: "Landing Pages", status: "active", lastRun: "7 min ago", successRate: 95 },
  { id: 14, name: "Forms & Magnets", status: "idle", lastRun: "18 min ago", successRate: 94 },
  { id: 15, name: "Behavioral Scoring", status: "active", lastRun: "5 min ago", successRate: 97 },
  { id: 16, name: "Conversion Feedback", status: "active", lastRun: "3 min ago", successRate: 96 },
];

const getStatusColor = (status: Agent["status"]) => {
  switch (status) {
    case "active":
      return "bg-success";
    case "idle":
      return "bg-muted-foreground";
    case "warning":
      return "bg-warning";
    case "error":
      return "bg-destructive";
    default:
      return "bg-muted-foreground";
  }
};

const getStatusText = (status: Agent["status"]) => {
  switch (status) {
    case "active":
      return "Active";
    case "idle":
      return "Idle";
    case "warning":
      return "Warning";
    case "error":
      return "Error";
    default:
      return "Unknown";
  }
};

export function AgentStatusGrid() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Status Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="border border-border rounded-lg p-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", getStatusColor(agent.status))} />
                  <span className="font-medium text-sm">{agent.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs h-5",
                      agent.status === "active" && "bg-success/10 text-success",
                      agent.status === "warning" && "bg-warning/10 text-warning",
                      agent.status === "error" && "bg-destructive/10 text-destructive"
                    )}
                  >
                    {getStatusText(agent.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Last Run:</span>
                  <span className="font-medium text-foreground">{agent.lastRun}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-medium text-foreground">{agent.successRate}%</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-2 h-7 text-xs">
                <Play className="h-3 w-3 mr-1" />
                Run Now
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
