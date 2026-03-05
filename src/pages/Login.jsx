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
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header Image */}
                <div className="relative h-44 bg-gray-200 overflow-hidden">
                    <img
                        src="/sampul_dashborad_log_in_dhpi.png"
                        alt="School Building"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Logo & Content */}
                <div className="pb-8 -mt-14 relative z-10" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
                    <div className="flex flex-col items-center text-center">
                        {/* Logo Circle */}
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl mb-4 flex items-center justify-center border-4 border-white overflow-hidden">
                            <img
                                src="/logo_sekolah_dhputri.png"
                                alt="Logo Sekolah"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-800 mb-1">SIPELSAN</h1>
                        <p className="text-gray-500 text-sm mb-6" style={{ marginBottom: '1rem' }}>
                            Sistem Pencatatan Pelanggaran Santriwati
                        </p>

                        <form onSubmit={handleSubmit} className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="space-y-1.5 text-left">
                                <label className="text-sm font-semibold text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none text-gray-800 placeholder:text-gray-400"
                                    placeholder="Masukkan Email"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none text-gray-800 placeholder:text-gray-400"
                                    placeholder="Masukkan password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                                    style={{
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                        padding: '1rem 1.5rem',
                                        fontSize: '1.125rem'
                                    }}
                                >
                                    {loading ? 'Memuat...' : 'Masuk Sekarang'}
                                </button>
                            </div>
                        </form>

                        <p className="text-gray-400 text-xs mt-8" style={{ marginBottom: '1rem' }}>
                            © 2025 Pondok Pesantren Darul Hijrah Putri - Batung
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
