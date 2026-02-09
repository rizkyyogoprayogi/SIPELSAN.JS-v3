# SIPELSAN - Sistem Manajemen Pelanggaran Santriwati

Aplikasi web untuk mengelola dan mencatat pelanggaran santriwati, akumulasi poin, dan pembuatan surat peringatan otomatis.

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Charts**: Recharts
- **PDF**: jsPDF
- **Deployment**: Vercel

## Features

- 🔐 **Authentication** - Login dengan Supabase Auth & Role-based Access Control
- 👩‍🎓 **Santriwati Management** - CRUD data santriwati
- 🏫 **Kelas Management** - CRUD data kelas  
- ⚠️ **Master Pelanggaran** - CRUD jenis pelanggaran & poin
- 📝 **Input Pelanggaran** - Form input dengan upload bukti
- 📊 **Dashboard** - Statistik & grafik pelanggaran
- 📜 **Riwayat** - Filter berdasarkan tanggal
- 📄 **Generate Surat** - PDF otomatis (SP1, SP2, SP3)

## Roles

| Role | Akses |
|------|-------|
| Admin | Full access semua fitur |
| Musyrifah | Input pelanggaran, lihat data |
| Pimpinan | Read only (lihat data saja) |

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/sipelsan.git
cd sipelsan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Copy `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dari Settings > API
3. Buat file `.env.local`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Jalankan SQL Schema di SQL Editor:
   - `supabase-schema.sql` - Membuat tabel
   - `supabase-rls.sql` - Row Level Security

5. Buat Storage Bucket:
   - Dashboard > Storage > Create Bucket
   - Nama: `pelanggaran`
   - Public: Yes

6. Buat user admin pertama di Authentication > Users

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173)

## Deployment

### Vercel + GitHub

1. Push ke GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/sipelsan.git
git push -u origin main
```

2. Connect Vercel ke GitHub:
   - Login [vercel.com](https://vercel.com)
   - Add New Project > Import dari GitHub
   - Add Environment Variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Deploy

3. Auto deploy aktif setiap push ke `main`

## Folder Structure

```
src/
├── components/
│   ├── layout/     # Sidebar, Navbar, Layout
│   └── ui/         # Button, Input, Modal, Table, Card
├── pages/          # Semua halaman
├── services/       # Supabase client
├── hooks/          # Custom hooks
├── utils/          # Helper functions
└── context/        # Auth context
```

## Surat Peringatan Threshold

| Jenis | Akumulasi Poin |
|-------|----------------|
| SP1 | 1 - 49 poin |
| SP2 | 50 - 99 poin |
| SP3 | ≥ 100 poin |

## License

MIT License

---

Built with ❤️ for Pondok Pesantren
