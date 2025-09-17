-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('student', 'professor');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  contact_info TEXT,
  student_id TEXT UNIQUE, -- Only for students
  staff_id TEXT UNIQUE, -- Only for professors
  department TEXT NOT NULL,
  branch TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints to ensure only students have student_id and only professors have staff_id
  CONSTRAINT student_id_check CHECK (
    (role = 'student' AND student_id IS NOT NULL AND staff_id IS NULL) OR
    (role = 'professor' AND staff_id IS NOT NULL AND student_id IS NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Professors can view all profiles
CREATE POLICY "Professors can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'professor'
  )
);

-- Create function to handle new user signup and profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    role,
    username,
    full_name,
    contact_info,
    student_id,
    staff_id,
    department,
    branch
  )
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data ->> 'role')::user_role,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'contact_info',
    NEW.raw_user_meta_data ->> 'student_id',
    NEW.raw_user_meta_data ->> 'staff_id',
    NEW.raw_user_meta_data ->> 'department',
    NEW.raw_user_meta_data ->> 'branch'
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update attendance records table to link with user profiles
ALTER TABLE public.attendance_records 
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD CONSTRAINT attendance_user_or_student_check CHECK (
  (user_id IS NOT NULL) OR (student_id IS NOT NULL AND student_name IS NOT NULL)
);

-- Create updated policies for attendance records
DROP POLICY IF EXISTS "Attendance records are viewable by everyone" ON public.attendance_records;
DROP POLICY IF EXISTS "Attendance records can be created by everyone" ON public.attendance_records;

-- Students can view their own attendance records
CREATE POLICY "Students can view their own attendance" 
ON public.attendance_records 
FOR SELECT 
USING (auth.uid() = user_id);

-- Professors can view all attendance records
CREATE POLICY "Professors can view all attendance" 
ON public.attendance_records 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'professor'
  )
);

-- Authenticated users can create attendance records
CREATE POLICY "Authenticated users can create attendance" 
ON public.attendance_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_attendance_records_user_id ON public.attendance_records(user_id);