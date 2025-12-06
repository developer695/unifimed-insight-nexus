/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_AD_CAMPAIGN_WEBHOOK_URL: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
