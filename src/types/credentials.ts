/**
 * Type definitions for platform credentials
 * Use these types in your TypeScript code for better type safety
 */

// ============================================
// Database Types
// ============================================

export interface CredentialRecord {
  id: string;
  user_id: string;
  platform_id: PlatformId;
  credentials: PlatformCredentials;
  created_at: string;
  updated_at: string;
}

// ============================================
// Platform Types
// ============================================

export type PlatformId =
  | "hubspot"
  | "linkedin"
  | "supabase"
  | "heyreach"
  | "smartlead"
  | "openai";

// ============================================
// Platform-Specific Credential Types
// ============================================

export interface HubSpotCredentials {
  apiKey: string;
  portalId: string;
}

export interface LinkedInCredentials {
  accessToken: string;
  organizationId?: string;
}

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

export interface HeyreachCredentials {
  apiKey: string;
  accountId: string;
}

export interface SmartleadCredentials {
  apiKey: string;
}

export interface OpenAICredentials {
  apiKey: string;
  model?: string;
  organizationId?: string;
}

// Union type for all platform credentials
export type PlatformCredentials =
  | HubSpotCredentials
  | LinkedInCredentials
  | SupabaseCredentials
  | HeyreachCredentials
  | SmartleadCredentials
  | OpenAICredentials;

// ============================================
// Helper Functions Type Definitions
// ============================================

export interface CredentialService {
  /**
   * Get credentials for a specific platform
   */
  getPlatformCredentials<T extends PlatformCredentials>(
    userId: string,
    platformId: PlatformId
  ): Promise<T | null>;

  /**
   * Get all credentials for a user
   */
  getAllUserCredentials(
    userId: string
  ): Promise<
    Array<{ platform_id: PlatformId; credentials: PlatformCredentials }>
  >;

  /**
   * Check if platform is connected
   */
  isPlatformConnected(userId: string, platformId: PlatformId): Promise<boolean>;

  /**
   * Save or update platform credentials
   */
  saveCredentials(
    userId: string,
    platformId: PlatformId,
    credentials: PlatformCredentials
  ): Promise<void>;

  /**
   * Delete platform credentials
   */
  deleteCredentials(userId: string, platformId: PlatformId): Promise<void>;
}

// ============================================
// n8n Webhook Payload Types
// ============================================

export interface SyncCredentialsPayload {
  userId: string;
  platformId: PlatformId;
  action: "created" | "updated" | "deleted";
}

export interface N8nWorkflowRequest {
  userId: string;
  platformId?: PlatformId;
  action: string;
  data?: Record<string, any>;
}

// ============================================
// Response Types
// ============================================

export interface CredentialResponse<
  T extends PlatformCredentials = PlatformCredentials
> {
  success: boolean;
  credentials?: T;
  error?: string;
}

export interface MultiCredentialResponse {
  success: boolean;
  credentials?: Record<PlatformId, PlatformCredentials>;
  error?: string;
}
