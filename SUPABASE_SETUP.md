# Supabase Setup Guide for Stellar Tuition

This guide explains how to set up your Supabase project to work with all features of Stellar Tuition.

---

## 1. Create Storage Bucket for Resources

### Step 1: Go to Storage
1. Open your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar

### Step 2: Create the Resources Bucket
1. Click **"New Bucket"**
2. Enter name: `resources`
3. Toggle **"Public bucket"** to ON
4. Click **"Create bucket"**

### Step 3: Set Up Storage Policies

Go to **Storage** → **Policies** tab and add these policies for the `resources` bucket:

#### Policy 1: Allow authenticated users to upload
```sql
-- Name: Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');
```

#### Policy 2: Allow public downloads
```sql
-- Name: Allow public downloads
CREATE POLICY "Allow public downloads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resources');
```

#### Policy 3: Allow owners to delete
```sql
-- Name: Allow owners to delete
CREATE POLICY "Allow owners to delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 2. Run Database Migrations

### Run the Migration SQL

Go to **SQL Editor** and run the contents of:
```
supabase/migrations/001_add_penalty_system.sql
```

This adds all the required columns to the students table:
- `penalty_history` - Penalty tracking
- `bonus_history` - Bonus/reward tracking
- `topic_mastery` - Skill tree mastery data
- `inventory`, `equipped_items`, `active_boosters` - Command Center shop
- `username` - Leaderboard display name
- And more...

---

## 3. Required Tables

Make sure these tables exist in your database:

### profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('tutor', 'student', 'parent')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### students
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  tutor_id UUID REFERENCES auth.users NOT NULL,
  year_group TEXT NOT NULL,
  subjects TEXT[] DEFAULT '{}',
  overall_progress INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  avatar_items JSONB,
  achievements TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  -- Add remaining fields from migration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Tutors can see their students
CREATE POLICY "Tutors can see their students"
ON students FOR SELECT
USING (tutor_id = auth.uid());

-- Policy: Tutors can update their students
CREATE POLICY "Tutors can update their students"
ON students FOR UPDATE
USING (tutor_id = auth.uid());
```

### parents
```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  student_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
```

### resources
```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  url TEXT,
  subject TEXT NOT NULL,
  year_group TEXT NOT NULL,
  assigned_to TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Policy: Tutors can manage their resources
CREATE POLICY "Tutors can manage resources"
ON resources FOR ALL
USING (tutor_id = auth.uid());

-- Policy: Students can see assigned resources
CREATE POLICY "Students can see assigned resources"
ON resources FOR SELECT
USING (
  auth.uid()::text = ANY(assigned_to)
  OR assigned_to = '{}'
);
```

---

## 4. Auth Trigger for Profile Creation

Create a trigger to automatically create a profile when a user signs up:

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## 5. Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 6. Quick Verification Checklist

- [ ] Storage bucket `resources` created and set to public
- [ ] Storage policies configured for upload/download
- [ ] Database migration `001_add_penalty_system.sql` executed
- [ ] All required tables exist: `profiles`, `students`, `parents`, `resources`
- [ ] Profile creation trigger is active
- [ ] Environment variables are set

---

## Troubleshooting

### "Error uploading file"
- Check that the `resources` bucket exists
- Verify the bucket is set to public
- Check that storage policies allow uploads

### "Topic mastery not saving"
- Run the migration SQL to add the `topic_mastery` column
- Verify the column exists: `SELECT topic_mastery FROM students LIMIT 1;`

### "Students not loading"
- Check RLS policies on the `students` table
- Verify the tutor is authenticated and has matching `tutor_id`
