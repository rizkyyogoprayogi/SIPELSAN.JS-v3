import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Mail, Lock, AlertTriangle } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn, user, configError } = useAuth()

    if (configError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="w-full max-w-lg glass rounded-2xl p-8 border border-border">
                    <div className="flex items-center gap-3 text-danger mb-4">
                        <AlertTriangle className="h-8 w-8" />
                        <h2 className="text-xl font-bold">Supabase Belum Dikonfigurasi</h2>
                    </div>

                    <p className="text-text-secondary mb-6">
                        Aplikasi tidak dapat terhubung ke database. Mohon ikuti langkah berikut:
                    </p>

                    <div className="space-y-4">
                        <div className="bg-surface-light/30 p-4 rounded-lg">
                            <h3 className="font-semibold text-text-primary mb-2">1. Buat File .env</h3>
                            <p className="text-sm text-text-secondary mb-2">Buat file <code>.env.local</code> di root folder project berisi:</p>
                            <pre className="bg-black/50 p-3 rounded text-xs text-primary font-mono overflow-x-auto">
                                VITE_SUPABASE_URL=your_project_url
                                VITE_SUPABASE_ANON_KEY=your_anon_key
                            </pre>
                        </div>

                        <div className="bg-surface-light/30 p-4 rounded-lg">
                            <h3 className="font-semibold text-text-primary mb-2">2. Restart Server</h3>
                            <p className="text-sm text-text-secondary">
                                Setelah file <code>.env.local</code> dibuat, restart development server.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-text-secondary">
                            Lihat <code>README.md</code> untuk instruksi lengkap setup database.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
        } catch (err) {
            setError(err.message || 'Email atau password salah')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-surface-light">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Header Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                        src="/sampul_dashborad_log_in_dhpi.png"
                        alt="School Building"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* Logo & Content */}
                <div className="px-8 pb-8 -mt-16 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        {/* Logo Circle */}
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mb-4 flex items-center justify-center border-4 border-emerald-500 overflow-hidden">
                            <img
                                src="/logo_sekolah_dhputri.png"
                                alt="Logo Sekolah"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <h1 className="text-2xl font-bold text-text-primary mb-1">Selamat Datang</h1>
                        <p className="text-text-secondary text-sm mb-8">
                            Aplikasi Pelanggaran Santriwati
                        </p>

                        <form onSubmit={handleSubmit} className="w-full space-y-5">
                            <div className="space-y-1.5 text-left">
                                <label className="text-sm font-semibold text-text-primary">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-text-primary placeholder:text-slate-400"
                                    placeholder="admin@sekolah.sch.id"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5 text-left">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-text-primary">Password</label>
                                    <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                        Lupa Password?
                                    </a>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-text-primary placeholder:text-slate-400"
                                    placeholder="Masukkan password Anda"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-4 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 mt-2"
                            >
                                {loading ? 'Memuat...' : 'Masuk'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
