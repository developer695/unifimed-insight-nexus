-- Create credentials table to store platform integration credentials
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id VARCHAR(50) NOT NULL,
  credentials JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_platform_id ON credentials(platform_id);

-- Enable Row Level Security
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own credentials
CREATE POLICY "Users can view their own credentials"
  ON credentials
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own credentials
CREATE POLICY "Users can insert their own credentials"
  ON credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own credentials
CREATE POLICY "Users can update their own credentials"
  ON credentials
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own credentials
CREATE POLICY "Users can delete their own credentials"
  ON credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_credentials_updated_at
  BEFORE UPDATE ON credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE credentials IS 'Stores encrypted platform integration credentials for each user';
COMMENT ON COLUMN credentials.platform_id IS 'Platform identifier (hubspot, linkedin, supabase, heyreach, smartlead, openai)';
COMMENT ON COLUMN credentials.credentials IS 'JSON object containing platform-specific credentials';
