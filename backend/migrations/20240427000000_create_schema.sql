-- 1. Create custom Users table (Since Supabase Auth is not used)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Profiles table (Linked 1:1 to our custom Users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  job_title TEXT,
  experience_summary TEXT,
  experience_years INTEGER DEFAULT 0,
  photo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Skills table (Global master list of skills)
CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- 4. Create profile_skills (Links users to multiple skills)
CREATE TABLE profile_skills (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency INTEGER CHECK (proficiency BETWEEN 1 AND 100), -- Optional, skill level %
  PRIMARY KEY (profile_id, skill_id)
);

-- 5. Create Projects table (Projects are now PRIVATE to each profile)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Each project belongs to ONE user
  name TEXT NOT NULL,
  client TEXT,
  location TEXT,
  description TEXT,
  role TEXT NOT NULL, -- The user's role on THIS specific project
  contributions TEXT, -- The user's specific work
  start_date DATE,
  end_date DATE,
  technologies_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
