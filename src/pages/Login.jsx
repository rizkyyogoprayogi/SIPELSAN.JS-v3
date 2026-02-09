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
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="fixed inset-0 -z-10 bg-background" />
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
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-4">
                        <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary">SIPELSAN</h1>
                    <p className="text-text-secondary mt-2">
                        Sistem Manajemen Pelanggaran Santriwati
                    </p>
                </div>

                {/* Login Form */}
                <div className="glass rounded-2xl p-8">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
                        Login ke Akun Anda
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email"
                            type="email"
                            icon={Mail}
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            icon={Lock}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            loading={loading}
                        >
                            Masuk
                        </Button>
                    </form>

                    <p className="text-center text-text-secondary text-sm mt-6">
                        Hubungi administrator jika lupa password
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-text-secondary text-sm mt-8">
                    © 2024 SIPELSAN v3.0
                </p>
            </div>
        </div>
    )
}

export default Login
