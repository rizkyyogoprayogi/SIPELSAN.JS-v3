-- ===========================================
-- SIPELSAN Row Level Security Policies
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.santriwati ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_pelanggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelanggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- PROFILES POLICIES
-- ===========================================

-- All authenticated users can read all profiles
CREATE POLICY "Profiles are viewable by authenticated users" 
  ON public.profiles FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ===========================================
-- KELAS POLICIES
-- ===========================================

-- All authenticated can read
CREATE POLICY "Kelas readable by all authenticated" 
  ON public.kelas FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only admin can insert
CREATE POLICY "Kelas insert for admin" 
  ON public.kelas FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admin can update
CREATE POLICY "Kelas update for admin" 
  ON public.kelas FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admin can delete
CREATE POLICY "Kelas delete for admin" 
  ON public.kelas FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ===========================================
-- SANTRIWATI POLICIES
-- ===========================================

-- All authenticated can read
CREATE POLICY "Santriwati readable by all authenticated" 
  ON public.santriwati FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only admin can insert
CREATE POLICY "Santriwati insert for admin" 
  ON public.santriwati FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin and musyrifah can update (for updating total_poin)
CREATE POLICY "Santriwati update for admin and musyrifah" 
  ON public.santriwati FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'musyrifah'))
  );

-- Only admin can delete
CREATE POLICY "Santriwati delete for admin" 
  ON public.santriwati FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ===========================================
-- MASTER PELANGGARAN POLICIES
-- ===========================================

-- All authenticated can read
CREATE POLICY "Master Pelanggaran readable by all authenticated" 
  ON public.master_pelanggaran FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only admin can insert
CREATE POLICY "Master Pelanggaran insert for admin" 
  ON public.master_pelanggaran FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admin can update
CREATE POLICY "Master Pelanggaran update for admin" 
  ON public.master_pelanggaran FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admin can delete
CREATE POLICY "Master Pelanggaran delete for admin" 
  ON public.master_pelanggaran FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ===========================================
-- PELANGGARAN POLICIES
-- ===========================================

-- All authenticated can read
CREATE POLICY "Pelanggaran readable by all authenticated" 
  ON public.pelanggaran FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Admin and musyrifah can insert
CREATE POLICY "Pelanggaran insert for admin and musyrifah" 
  ON public.pelanggaran FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'musyrifah'))
  );

-- Admin and musyrifah can update
CREATE POLICY "Pelanggaran update for admin and musyrifah" 
  ON public.pelanggaran FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'musyrifah'))
  );

-- Only admin can delete
CREATE POLICY "Pelanggaran delete for admin" 
  ON public.pelanggaran FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ===========================================
-- SURAT POLICIES
-- ===========================================

-- All authenticated can read
CREATE POLICY "Surat readable by all authenticated" 
  ON public.surat FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only admin can insert
CREATE POLICY "Surat insert for admin" 
  ON public.surat FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admin can delete
CREATE POLICY "Surat delete for admin" 
  ON public.surat FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ===========================================
-- STORAGE POLICIES
-- ===========================================
-- Run these in Supabase Dashboard > Storage > Policies

-- Create bucket 'pelanggaran' with public access
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pelanggaran', 'pelanggaran', true);

-- Policy: Authenticated users can upload
-- CREATE POLICY "Authenticated users can upload" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'pelanggaran');

-- Policy: Public can view
-- CREATE POLICY "Public can view" ON storage.objects
--   FOR SELECT TO public
--   USING (bucket_id = 'pelanggaran');
