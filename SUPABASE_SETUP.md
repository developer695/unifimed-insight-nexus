# Supabase Setup Guide for UnifiMed Dashboard

## 🔧 Supabase Configuration Steps

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: unifimed-dashboard (or your choice)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Your API Credentials
1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** section
3. Copy these values to your `.env` file:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

Example `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Enable Email Authentication
1. Navigate to **Authentication** → **Providers** in the left sidebar
2. Find **Email** provider
3. Toggle it to **Enabled**
4. **Optional**: Configure email templates
   - Click on **Email Templates**
   - Customize: Confirmation, Password Reset, Magic Link emails

### 4. Configure Authentication Settings
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: 
   - Development: `http://localhost:5173`
   - Production: Your production URL
3. Add **Redirect URLs**:
   - `http://localhost:5173/**`
   - Add your production URL when deploying

### 5. Create Users Table (Optional but Recommended)
1. Go to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policy: Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Create policy: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile automatically
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

4. Click **Run** or press `Ctrl+Enter`

### 6. Create Test User
1. Navigate to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email**: test@example.com (or your email)
   - **Password**: Create a password (min 6 characters)
   - **Auto Confirm User**: Toggle ON (for testing)
4. Click **Create user**

### 7. Security Settings (Important!)
1. Go to **Authentication** → **Settings**
2. Configure these settings:

   **Email Authentication:**
   - ✅ Enable email confirmations (disable for testing, enable for production)
   - Set minimum password length (default: 6, recommended: 8+)

   **Security:**
   - Enable **Email Rate Limiting** to prevent abuse
   - Set **JWT expiry**: Default is 3600 seconds (1 hour)
   - Consider enabling **Multi-Factor Authentication** for production

### 8. Row Level Security (RLS) Policies
If you plan to store user-specific data, ensure RLS is enabled:

```sql
-- Example: Create a user_data table with RLS
create table public.user_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.user_data enable row level security;

-- Users can only see their own data
create policy "Users can view own data"
  on public.user_data for select
  using ( auth.uid() = user_id );

-- Users can insert their own data
create policy "Users can insert own data"
  on public.user_data for insert
  with check ( auth.uid() = user_id );

-- Users can update their own data
create policy "Users can update own data"
  on public.user_data for update
  using ( auth.uid() = user_id );

-- Users can delete their own data
create policy "Users can delete own data"
  on public.user_data for delete
  using ( auth.uid() = user_id );
```

### 9. Testing the Integration
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`

3. Try logging in with the test user credentials you created

4. After successful login, you should be redirected to the dashboard

### 10. Additional Configuration (Optional)

#### Enable Password Recovery
1. Go to **Authentication** → **Email Templates**
2. Customize "Reset Password" template
3. Test password reset flow

#### Add OAuth Providers (Google, GitHub, etc.)
1. Go to **Authentication** → **Providers**
2. Enable desired provider (e.g., Google, GitHub)
3. Follow provider-specific setup instructions
4. Update your login page to include OAuth buttons

#### Set Up Realtime Subscriptions (if needed)
1. Go to **Database** → **Replication**
2. Enable replication for tables you want to listen to
3. Use Supabase Realtime in your app:
   ```typescript
   const subscription = supabase
     .channel('any')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, 
       payload => console.log(payload))
     .subscribe()
   ```

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use environment variables** for all sensitive data
3. **Enable RLS** on all tables containing user data
4. **Validate user input** on both client and server
5. **Use HTTPS** in production
6. **Rotate keys** periodically in production
7. **Monitor authentication logs** in Supabase dashboard

## 🚀 Production Deployment

Before deploying to production:

1. Create a new `.env.production` file with production Supabase credentials
2. Update **Site URL** and **Redirect URLs** in Supabase to your production domain
3. Enable **Email Confirmations** in Authentication settings
4. Review and tighten **RLS policies**
5. Set up proper error tracking (e.g., Sentry)
6. Enable rate limiting on your routes

## 📚 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## 🐛 Troubleshooting

**Issue**: "Invalid login credentials"
- Verify user exists in Authentication → Users
- Check if Auto Confirm User was enabled when creating user
- Verify email/password are correct

**Issue**: "Missing Supabase environment variables"
- Ensure `.env` file exists in project root
- Verify variable names match exactly (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Restart dev server after changing `.env`

**Issue**: Redirect to login after successful authentication
- Check if JWT token is being stored properly
- Verify ProtectedRoute logic
- Check browser console for errors

**Issue**: CORS errors
- Verify Site URL and Redirect URLs in Supabase settings
- Ensure URLs match exactly (including port numbers)
