-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id, attendance_date)
);

-- Enable Row Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for subjects (readable by everyone for now since no auth)
CREATE POLICY "Subjects are viewable by everyone" 
ON public.subjects 
FOR SELECT 
USING (true);

CREATE POLICY "Subjects can be created by everyone" 
ON public.subjects 
FOR INSERT 
WITH CHECK (true);

-- Create policies for attendance records
CREATE POLICY "Attendance records are viewable by everyone" 
ON public.attendance_records 
FOR SELECT 
USING (true);

CREATE POLICY "Attendance records can be created by everyone" 
ON public.attendance_records 
FOR INSERT 
WITH CHECK (true);

-- Insert some sample subjects
INSERT INTO public.subjects (name, code) VALUES 
('Mathematics', 'MATH101'),
('Physics', 'PHYS101'),
('Computer Science', 'CS101'),
('Chemistry', 'CHEM101');

-- Create indexes for better performance
CREATE INDEX idx_attendance_records_subject_id ON public.attendance_records(subject_id);
CREATE INDEX idx_attendance_records_date ON public.attendance_records(attendance_date);
CREATE INDEX idx_attendance_records_student_id ON public.attendance_records(student_id);