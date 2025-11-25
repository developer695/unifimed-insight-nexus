# Credentials Management System

## Overview

This system stores platform integration credentials in Supabase with user-specific access control. Each user's credentials are stored securely and can be retrieved by n8n workflows based on the logged-in user's ID.

## Database Setup

### 1. Run the Migration

Execute the SQL migration file to create the credentials table:

```bash
# Navigate to your Supabase project SQL Editor and run:
supabase_migrations/create_credentials_table.sql
```

Or run it directly via Supabase CLI:

```bash
supabase db push
```

### 2. Table Structure

The `credentials` table has the following structure:

```sql
credentials (
  id UUID PRIMARY KEY,
  user_id UUID (references auth.users),
  platform_id VARCHAR(50),
  credentials JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Supported Platform IDs:**

- `hubspot`
- `linkedin`
- `supabase`
- `heyreach`
- `smartlead`
- `openai`

## How It Works

### Frontend (Dashboard)

1. **User logs in** → Dashboard gets user ID from Auth Context
2. **User adds credentials** → Stored in Supabase `credentials` table with user_id
3. **Credentials are encrypted** → Stored as JSONB in the database
4. **Sync notification** → Optional webhook sent to n8n to trigger credential sync

### Backend (n8n)

When n8n workflows need to use platform credentials, they should:

1. **Receive user_id** from the dashboard request
2. **Query Supabase** to get credentials for that specific user
3. **Use the credentials** in the workflow

## n8n Integration

### Setting Up n8n to Retrieve Credentials

Create a webhook endpoint in n8n that receives the user ID and fetches credentials:

#### Example n8n Workflow

1. **Webhook Node** - Receives requests with `userId` and `platformId`
2. **Supabase Node** - Queries credentials table
3. **Function Node** - Extracts and formats credentials
4. **Use Credentials** - In subsequent nodes

### Supabase Query in n8n

```javascript
// In a Function node or HTTP Request node
const userId = $json.userId;
const platformId = $json.platformId;

// Query Supabase
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_SERVICE_ROLE_KEY";

const response = await fetch(
  `${supabaseUrl}/rest/v1/credentials?user_id=eq.${userId}&platform_id=eq.${platformId}`,
  {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
  }
);

const credentials = await response.json();
return credentials[0]?.credentials || {};
```

### Sync Webhook Endpoint

The dashboard sends sync notifications to:

```
POST ${VITE_N8N_WEBHOOK_URL}/sync-credentials
```

**Payload:**

```json
{
  "userId": "user-uuid",
  "platformId": "hubspot",
  "action": "created" | "updated" | "deleted"
}
```

You can use this to:

- Cache credentials in n8n
- Trigger specific workflows
- Update integration status
- Log credential changes

## Security Features

### Row Level Security (RLS)

The credentials table has RLS policies that ensure:

- ✅ Users can only view their own credentials
- ✅ Users can only insert credentials with their own user_id
- ✅ Users can only update their own credentials
- ✅ Users can only delete their own credentials
- ❌ No user can access another user's credentials

### Best Practices

1. **Never expose service role key** in frontend code
2. **Use HTTPS** for all credential transmissions
3. **Rotate API keys** regularly
4. **Monitor credential access** via Supabase logs
5. **Implement credential encryption** at rest (Supabase does this by default)

## Example n8n Workflow Structure

```
┌─────────────────┐
│ Dashboard       │
│ (User Action)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase        │
│ Store Creds     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ n8n Webhook     │
│ /sync-creds     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Marketing       │
│ Automation      │
│ Workflow        │
└─────────────────┘
```

## Testing

### Test Creating Credentials

```javascript
// From the dashboard, or via API
const testCredentials = {
  apiKey: "test-key-123",
  portalId: "12345",
};

// This will be stored in Supabase
```

### Test Retrieving Credentials (n8n)

```bash
curl -X POST https://your-supabase.co/rest/v1/credentials \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "user_id": "eq.USER_UUID",
    "platform_id": "eq.hubspot"
  }'
```

## Troubleshooting

### Credentials Not Saving

- Check user is authenticated
- Verify Supabase RLS policies are enabled
- Check browser console for errors

### n8n Can't Retrieve Credentials

- Ensure service role key is used (not anon key)
- Verify user_id format (must be UUID)
- Check network connectivity to Supabase

### Credentials Not Syncing

- Verify `VITE_N8N_WEBHOOK_URL` is set correctly
- Check n8n webhook is active and listening
- Review n8n execution logs

## Environment Variables

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

### n8n

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

## Support

For issues or questions:

1. Check Supabase logs for database errors
2. Review n8n execution history
3. Verify all environment variables are set correctly
4. Ensure user authentication is working properly
