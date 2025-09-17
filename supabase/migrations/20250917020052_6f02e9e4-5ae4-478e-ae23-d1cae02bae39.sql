-- Change student_id type to TEXT for prototype (no auth yet)
ALTER TABLE public.attendance_records
  ALTER COLUMN student_id TYPE TEXT USING student_id::text;