import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-text-secondary">Memuat...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="min-h-screen flex">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-h-screen">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Layout
