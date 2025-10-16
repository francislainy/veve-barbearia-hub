# 🔄 Fresh Start Setup Guide

## Option 1: Keep Lovable Supabase & Clean It Up (Easiest)

### Step 1: Access Your Supabase Dashboard
Since your app is on Lovable, they provide you with a Supabase instance. Here's how to access it:

1. **Go to Lovable.dev** and open your project
2. **Click on "Integrations"** or **"Database"** in the sidebar
3. **Look for "Supabase" link** - Lovable provides direct access
4. **Click "Open Supabase Dashboard"** or copy the provided link

### Step 2: Delete All Users
1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Select all users (checkbox at the top)
3. Click **"Delete selected users"**
4. Confirm deletion

### Step 3: Run the Cleanup Migration
1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste this SQL:

```sql
-- Clean up all data
TRUNCATE TABLE public.bookings CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
```

3. Click **Run** to execute

### Step 4: Create Fresh Admin Account
1. Go to your app
2. Sign up with:
   - Email: `francislainy.campos@gmail.com`
   - Password: `12345678`
3. The migration will automatically promote this account to admin!

---

## Option 2: Create Your Own Supabase Project (Full Control)

### Step 1: Create New Supabase Project
1. Go to **https://supabase.com**
2. **Sign up** or **Log in**
3. Click **"New Project"**
4. Fill in:
   - **Name**: `veve-barbearia`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (e.g., South America)
5. Wait 2-3 minutes for project to be created

### Step 2: Get Your Supabase Credentials
1. In your new project dashboard, look at the **left sidebar**
2. Click **"Settings"** (gear icon at the bottom)
3. In the Settings menu, click **"API"**
4. You'll see a page with several keys. Look for:

   **Project URL:**
   ```
   https://abcdefghijk.supabase.co
   ```
   Copy this entire URL - this is your VITE_SUPABASE_URL

   **Project API keys section:**
   You'll see two keys:
   - `anon` `public` (this one says "anon public" or just "anon" next to it)
   - `service_role` `secret` (DON'T use this one!)

   The **anon public key** looks like this:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MTk4NTU3NjAwMH0.randomstringhere
   ```
   
   It's a very long string (looks like random characters). Copy the entire thing.
   This is your VITE_SUPABASE_ANON_KEY.

   ⚠️ **Important:** Use the "anon public" key, NOT the "service_role" key!

### Step 3: Update Your App's Environment Variables
1. In your project folder, look for a file called `.env.local`
2. If it doesn't exist, create it in the root folder (same level as `package.json`)
3. Paste these two lines:

```bash
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

Replace:
- `https://abcdefghijk.supabase.co` with YOUR actual Project URL
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here` with YOUR actual anon public key

4. **Save the file**
5. **Restart your dev server** (stop and run `npm run dev` again)

### Step 4: Run All Migrations
1. In Supabase Dashboard, go to **SQL Editor**
2. Run each migration file in order:
   - `20251014141321_2d58b943-af2c-486e-8ad3-6c2aebac1af2.sql` (create bookings table)
   - `20251014142129_0d6f0c0b-3919-449a-93d1-bc68219add71.sql` (create roles & profiles)
   - `20251015155900_80c833a9-b581-4375-b623-798329fbec3f.sql` (add user_id to bookings)
   - `20250116000000_add_admin_user.sql` (admin management functions)

Just copy the contents of each file and paste into SQL Editor, then click **Run**.

### Step 5: Create Your Admin Account
1. Go to your app
2. Sign up with:
   - Email: `francislainy.campos@gmail.com`
   - Password: `12345678`

3. In Supabase Dashboard → SQL Editor, run:
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'francislainy.campos@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

4. **Refresh your app** and login - you'll see the Admin badge!

---

## 🎯 Which Option Should You Choose?

### Choose **Option 1** if:
- ✅ You want the quickest setup
- ✅ Lovable's Supabase is working fine
- ✅ You just want to clean up test data

### Choose **Option 2** if:
- ✅ You want full database control
- ✅ You want to manage users directly
- ✅ You're planning to deploy elsewhere (not just Lovable)
- ✅ You want access to Supabase features like logs, monitoring, etc.

---

## 💡 My Recommendation: Option 1

For now, **stick with Lovable's Supabase** and just clean it up:
1. Find the Supabase link in your Lovable project settings
2. Delete all users in Authentication → Users
3. Run the cleanup SQL
4. Create fresh admin account

You can always migrate to your own Supabase later if needed!

---

## Need Help Finding Lovable's Supabase Dashboard?

Look for these in your Lovable project:
- **"Integrations" tab** in the left sidebar
- **"Database" or "Supabase" section**
- **Settings → Integrations**
- A button that says **"Open Database"** or **"View Supabase"**

If you still can't find it, let me know and I'll help you with Option 2 (creating your own Supabase project).
