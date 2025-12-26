import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Mail,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  BarChart3,
  Mic,
  Tag,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: LayoutDashboard,
  },

  {
    title: "Voice Engine",
    href: "/voice-engine",
    icon: Mic,
  },
  {
    title: "Contact Intelligence",
    href: "/contact-intelligence",
    icon: Users,
  },
  {
    title: "Outreach",
    href: "/outreach",
    icon: Mail,
  },
  {
    title: "Scheduling & Meetings",
    href: "/scheduling",
    icon: Calendar,
  },
  {
    title: "SEO Keywords",
    href: "/seo-keywords",
    icon: Tag,
  },
  {
    title: "Content Engine",
    href: "/content",
    icon: FileText,
  },
  {
    title: "Ad Campaigns",
    href: "/ad-campaigns",
    icon: Target,
  },
  // {
  //   title: "System Health",
  //   href: "/system-health",
  //   icon: Activity,
  // },
  // {
  //   title: "Cost & ROI",
  //   href: "/roi",
  //   icon: DollarSign,
  // },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Landing Pages",
    href: "/landing-pages",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface DashboardSidebarProps {
  collapsed: boolean;
}

export function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  return (
    <ScrollArea className="flex-1 px-2 py-4">
      <TooltipProvider delayDuration={0}>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const linkContent = (
              <NavLink
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive &&
                    "bg-sidebar-primary text-sidebar-primary-foreground",
                    collapsed && "justify-center"
                  )
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>
      </TooltipProvider>
    </ScrollArea>
  );
}
