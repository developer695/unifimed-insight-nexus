# Quick Setup Guide - Credentials Management

## 🚀 Setup Steps

### Step 1: Run the Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_migrations/create_credentials_table.sql`
4. Click **Run** to execute the migration

This will create:

- ✅ `credentials` table
- ✅ Row Level Security policies
- ✅ Indexes for performance
- ✅ Automatic timestamp updates

### Step 2: Verify Environment Variables

Check your `.env` file has:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

### Step 3: Test the Settings Page

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Log in to your dashboard
3. Navigate to **Settings**
4. Try connecting a platform (e.g., HubSpot)
5. Check Supabase dashboard to verify the credential was saved

### Step 4: Set Up n8n Integration (Optional)

1. In n8n, create a new workflow
2. Add a **Webhook** node listening at `/sync-credentials`
3. Add a **Function** node with this code:

```javascript
// Configure these
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_SERVICE_KEY = "YOUR_SERVICE_ROLE_KEY";

const userId = $json.userId;
const platformId = $json.platformId;

// Fetch credentials from Supabase
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/credentials?user_id=eq.${userId}&platform_id=eq.${platformId}`,
  {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  }
);

const data = await response.json();
return data[0]?.credentials || {};
```

4. Save and activate the workflow

## 🔍 Testing

### Test 1: Save Credentials

1. Go to Settings page
2. Click "Configure Integration" on any platform
3. Enter test credentials:
   - HubSpot API Key: `test-key-123`
   - HubSpot Portal ID: `12345`
4. Click "Connect"
5. Should see success message

### Test 2: Verify in Supabase

1. Open Supabase Dashboard → Table Editor
2. Select `credentials` table
3. You should see your entry with:
   - `user_id`: Your user UUID
   - `platform_id`: `hubspot`
   - `credentials`: JSON with your test data

### Test 3: Load Existing Credentials

1. Refresh the Settings page
2. HubSpot should show as "Connected"
3. Click "Update Credentials" to verify form still works

### Test 4: Delete Credentials

1. Click "Disconnect" on a connected platform
2. Confirm it shows as "Not Connected"
3. Verify in Supabase the record is deleted

## 📊 Database Schema

```sql
credentials
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → auth.users)
├── platform_id (VARCHAR)
│   ├── hubspot
│   ├── linkedin
│   ├── supabase
│   ├── heyreach
│   ├── smartlead
│   └── openai
├── credentials (JSONB)
│   └── Platform-specific fields
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

## 🔐 Security Features

- ✅ **Row Level Security**: Users can only access their own credentials
- ✅ **User Isolation**: Each user's credentials are completely separate
- ✅ **Automatic Policies**: Insert, Update, Delete policies enforce user_id matching
- ✅ **Encrypted Storage**: Supabase encrypts data at rest
- ✅ **HTTPS Only**: All API calls use secure connections

## 🛠 n8n Workflow Example

When a user triggers an automation, n8n should:

```
1. Receive Request (with userId)
   ↓
2. Fetch User's Credentials from Supabase
   ↓
3. Use Credentials in API Calls
   ↓
4. Execute Automation
   ↓
5. Return Results
```

## 📝 Common Issues

### Issue: Credentials not saving

**Solution**:

- Check user is authenticated (`user` object exists)
- Verify RLS policies are enabled
- Check browser console for errors

### Issue: Settings page shows "Loading..." forever

**Solution**:

- Ensure credentials table exists in Supabase
- Check Supabase URL and anon key in `.env`
- Verify user authentication is working

### Issue: n8n can't fetch credentials

**Solution**:

- Use **Service Role Key**, not anon key
- Verify user_id is correct UUID format
- Check Supabase URL is accessible from n8n

### Issue: "Update" not working

**Solution**:

- Check the UNIQUE constraint on (user_id, platform_id)
- Verify UPDATE policy is enabled
- Clear form and try again

## 🎯 Next Steps

1. ✅ Set up credentials table in Supabase
2. ✅ Test saving credentials from dashboard
3. ⬜ Configure n8n workflows to use credentials
4. ⬜ Implement additional security measures (optional)
5. ⬜ Add credential encryption layer (optional)
6. ⬜ Set up monitoring and logging

## 📚 Additional Resources

- **Full Documentation**: `CREDENTIALS_SETUP.md`
- **n8n Helpers**: `n8n_helpers/credentials-fetcher.js`
- **TypeScript Types**: `src/types/credentials.ts`
- **Supabase Docs**: https://supabase.com/docs
- **n8n Docs**: https://docs.n8n.io

## 🆘 Support

If you encounter issues:

1. Check the migration ran successfully
2. Verify environment variables
3. Review Supabase logs
4. Check browser console for frontend errors
5. Review n8n execution logs for backend errors
