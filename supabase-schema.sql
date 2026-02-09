-- ===========================================
-- SIPELSAN Database Schema
-- Sistem Manajemen Pelanggaran Santriwati
-- ===========================================

-- Users Profile (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'musyrifah', 'pimpinan')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kelas
CREATE TABLE public.kelas (
  id SERIAL PRIMARY KEY,
  nama_kelas VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Santriwati
CREATE TABLE public.santriwati (
  id SERIAL PRIMARY KEY,
  nis VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  kelas_id INT REFERENCES public.kelas(id) ON DELETE SET NULL,
  total_poin INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master Pelanggaran
CREATE TABLE public.master_pelanggaran (
  id SERIAL PRIMARY KEY,
  nama_pelanggaran VARCHAR(255) NOT NULL,
  kategori VARCHAR(50) NOT NULL CHECK (kategori IN ('ringan', 'sedang', 'berat')),
  poin INT NOT NULL CHECK (poin > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pelanggaran (Transaksi)
CREATE TABLE public.pelanggaran (
  id SERIAL PRIMARY KEY,
  santriwati_id INT REFERENCES public.santriwati(id) ON DELETE CASCADE,
  pelanggaran_id INT REFERENCES public.master_pelanggaran(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  keterangan TEXT,
  bukti_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surat Peringatan
CREATE TABLE public.surat (
  id SERIAL PRIMARY KEY,
  santriwati_id INT REFERENCES public.santriwati(id) ON DELETE CASCADE,
  jenis_surat VARCHAR(50) NOT NULL CHECK (jenis_surat IN ('SP1', 'SP2', 'SP3')),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  file_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CREATE INDEXES
-- ===========================================

CREATE INDEX idx_santriwati_kelas ON public.santriwati(kelas_id);
CREATE INDEX idx_santriwati_total_poin ON public.santriwati(total_poin DESC);
CREATE INDEX idx_pelanggaran_santriwati ON public.pelanggaran(santriwati_id);
CREATE INDEX idx_pelanggaran_tanggal ON public.pelanggaran(tanggal DESC);
CREATE INDEX idx_surat_santriwati ON public.surat(santriwati_id);

-- ===========================================
-- TRIGGER: Auto create profile on signup
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'musyrifah')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
