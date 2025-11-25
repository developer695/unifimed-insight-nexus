import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  Linkedin,
  Database,
  Mail,
  Brain,
  Target,
  Link2,
} from "lucide-react";

// Platform configuration interface
interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
  }[];
  color: string;
}

// Platform configurations
const platforms: PlatformConfig[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    icon: <Target className="h-6 w-6" />,
    description: "Connect your HubSpot CRM for contact and deal management",
    color: "hsl(15, 100%, 60%)",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "Enter your HubSpot API key",
        required: true,
      },
      {
        name: "portalId",
        label: "Portal ID",
        type: "text",
        placeholder: "Enter your HubSpot Portal ID",
        required: true,
      },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <Linkedin className="h-6 w-6" />,
    description: "Connect LinkedIn for lead generation and outreach campaigns",
    color: "hsl(210, 100%, 40%)",
    fields: [
      {
        name: "accessToken",
        label: "Access Token",
        type: "password",
        placeholder: "Enter your LinkedIn access token",
        required: true,
      },
      {
        name: "organizationId",
        label: "Organization ID",
        type: "text",
        placeholder: "Enter your LinkedIn organization ID",
        required: false,
      },
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    icon: <Database className="h-6 w-6" />,
    description: "Configure your Supabase database connection",
    color: "hsl(122, 39%, 49%)",
    fields: [
      {
        name: "url",
        label: "Project URL",
        type: "text",
        placeholder: "https://your-project.supabase.co",
        required: true,
      },
      {
        name: "anonKey",
        label: "Anon/Public Key",
        type: "password",
        placeholder: "Enter your Supabase anon key",
        required: true,
      },
      {
        name: "serviceKey",
        label: "Service Role Key",
        type: "password",
        placeholder: "Enter your Supabase service role key",
        required: false,
      },
    ],
  },
  {
    id: "heyreach",
    name: "Heyreach",
    icon: <Link2 className="h-6 w-6" />,
    description: "Integrate Heyreach for automated LinkedIn outreach",
    color: "hsl(271, 76%, 53%)",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "Enter your Heyreach API key",
        required: true,
      },
      {
        name: "accountId",
        label: "Account ID",
        type: "text",
        placeholder: "Enter your Heyreach account ID",
        required: true,
      },
    ],
  },
  {
    id: "smartlead",
    name: "Smartlead",
    icon: <Mail className="h-6 w-6" />,
    description: "Connect Smartlead for email outreach automation",
    color: "hsl(187, 100%, 42%)",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "Enter your Smartlead API key",
        required: true,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: <Brain className="h-6 w-6" />,
    description: "Configure OpenAI for AI-powered content generation",
    color: "hsl(207, 90%, 54%)",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "sk-...",
        required: true,
      },
      {
        name: "model",
        label: "Default Model",
        type: "text",
        placeholder: "gpt-4-turbo-preview",
        required: false,
      },
      {
        name: "organizationId",
        label: "Organization ID",
        type: "text",
        placeholder: "org-...",
        required: false,
      },
    ],
  },
];

// Platform connection status type
type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error";

interface PlatformCardProps {
  platform: PlatformConfig;
  status: ConnectionStatus;
  onConnect: (platformId: string, credentials: Record<string, string>) => void;
  onDisconnect: (platformId: string) => void;
}

function PlatformCard({
  platform,
  status,
  onConnect,
  onDisconnect,
}: PlatformCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(platform.id, credentials);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case "connecting":
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Connecting...
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">Not Connected</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${platform.color}20`,
                color: platform.color,
              }}
            >
              {platform.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{platform.name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {platform.description}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {status === "connected" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {platform.name} is successfully connected and ready to use.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Hide" : "Update"} Credentials
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDisconnect(platform.id)}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="default"
            className="w-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide Form" : "Configure Integration"}
          </Button>
        )}

        {isExpanded && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {platform.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`${platform.id}-${field.name}`}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                <Input
                  id={`${platform.id}-${field.name}`}
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={credentials[field.name] || ""}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      [field.name]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={status === "connecting"}
              >
                {status === "connecting" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [platformStatuses, setPlatformStatuses] = useState<
    Record<string, ConnectionStatus>
  >(platforms.reduce((acc, p) => ({ ...acc, [p.id]: "disconnected" }), {}));
  const [loading, setLoading] = useState(true);

  // Load existing credentials on component mount
  useEffect(() => {
    if (user) {
      loadCredentials();
    }
  }, [user]);

  const loadCredentials = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("credentials")
        .select("platform_id")
        .eq("user_id", user.id);

      if (error) throw error;

      // Update status for platforms that have credentials
      const newStatuses = { ...platformStatuses };
      data?.forEach((cred) => {
        newStatuses[cred.platform_id] = "connected";
      });
      setPlatformStatuses(newStatuses);
    } catch (error) {
      console.error("Error loading credentials:", error);
      toast({
        title: "Error Loading Credentials",
        description: "Failed to load your saved integrations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (
    platformId: string,
    credentials: Record<string, string>
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save credentials.",
        variant: "destructive",
      });
      return;
    }

    // Set connecting status
    setPlatformStatuses((prev) => ({ ...prev, [platformId]: "connecting" }));

    try {
      // Check if credentials already exist for this platform
      const { data: existingCreds } = await supabase
        .from("credentials")
        .select("id")
        .eq("user_id", user.id)
        .eq("platform_id", platformId)
        .single();

      let result;
      if (existingCreds) {
        // Update existing credentials
        result = await supabase
          .from("credentials")
          .update({
            credentials: credentials,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("platform_id", platformId);
      } else {
        // Insert new credentials
        result = await supabase.from("credentials").insert({
          user_id: user.id,
          platform_id: platformId,
          credentials: credentials,
        });
      }

      if (result.error) throw result.error;

      // Notify n8n about the credential update (optional, for syncing)
      try {
        await fetch(
          `${import.meta.env.VITE_N8N_WEBHOOK_URL}/sync-credentials`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              platformId: platformId,
              action: existingCreds ? "updated" : "created",
            }),
          }
        );
      } catch (webhookError) {
        console.warn("Failed to notify n8n:", webhookError);
        // Don't fail the whole operation if webhook fails
      }

      // Update status to connected
      setPlatformStatuses((prev) => ({ ...prev, [platformId]: "connected" }));

      toast({
        title: "Connection Successful",
        description: `${
          platforms.find((p) => p.id === platformId)?.name
        } has been connected successfully.`,
      });
    } catch (error) {
      // Update status to error
      setPlatformStatuses((prev) => ({ ...prev, [platformId]: "error" }));

      toast({
        title: "Connection Failed",
        description: `Failed to save credentials for ${
          platforms.find((p) => p.id === platformId)?.name
        }. Please try again.`,
        variant: "destructive",
      });

      console.error(`Error saving credentials for ${platformId}:`, error);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!user) return;

    try {
      // Delete credentials from Supabase
      const { error } = await supabase
        .from("credentials")
        .delete()
        .eq("user_id", user.id)
        .eq("platform_id", platformId);

      if (error) throw error;

      // Notify n8n about the credential removal (optional)
      try {
        await fetch(
          `${import.meta.env.VITE_N8N_WEBHOOK_URL}/sync-credentials`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              platformId: platformId,
              action: "deleted",
            }),
          }
        );
      } catch (webhookError) {
        console.warn("Failed to notify n8n:", webhookError);
      }

      // Update status to disconnected
      setPlatformStatuses((prev) => ({
        ...prev,
        [platformId]: "disconnected",
      }));

      toast({
        title: "Disconnected",
        description: `${
          platforms.find((p) => p.id === platformId)?.name
        } has been disconnected.`,
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: `Failed to disconnect from ${
          platforms.find((p) => p.id === platformId)?.name
        }.`,
        variant: "destructive",
      });

      console.error(`Error disconnecting from ${platformId}:`, error);
    }
  };

  const connectedCount = Object.values(platformStatuses).filter(
    (s) => s === "connected"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Settings & Integrations
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your marketing and automation platforms to power your
            dashboard
          </p>
        </div>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {connectedCount}/{platforms.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Platforms Connected
            </div>
          </div>
        </Card>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            status={platformStatuses[platform.id]}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>

      {/* Information Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">About Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • All credentials are securely stored in Supabase with Row Level
            Security, ensuring only you can access your integration data.
          </p>
          <p>
            • Your credentials are automatically synced to n8n workflows based
            on your user ID, enabling personalized automation for each user.
          </p>
          <p>
            • Each platform integration enables specific automation workflows
            across your marketing agents.
          </p>
          <p>
            • You can update credentials at any time by clicking the "Update
            Credentials" button on connected platforms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
