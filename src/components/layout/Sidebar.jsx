import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    AlertTriangle,
    FileInput,
    History,
    FileText,
    Settings
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
    const { profile, canInput, canManage } = useAuth()

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: LayoutDashboard,
            show: true
        },
        {
            name: 'Santriwati',
            path: '/santriwati',
            icon: Users,
            show: canManage
        },
        {
            name: 'Kelas',
            path: '/kelas',
            icon: GraduationCap,
            show: canManage
        },
        {
            name: 'Master Pelanggaran',
            path: '/master-pelanggaran',
            icon: AlertTriangle,
            show: canManage
        },
        {
            name: 'Input Pelanggaran',
            path: '/input-pelanggaran',
            icon: FileInput,
            show: canInput
        },
        {
            name: 'Riwayat',
            path: '/riwayat',
            icon: History,
            show: true
        },
        {
            name: 'Generate Surat',
            path: '/generate-surat',
            icon: FileText,
            show: canManage
        }
    ]

    const filteredMenu = menuItems.filter(item => item.show)

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 glass border-r border-border
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-center border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-text-primary">SIPELSAN</h1>
                            <p className="text-xs text-text-secondary">v3.0</p>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                            <span className="text-white font-semibold">
                                {profile?.nama?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                                {profile?.nama || 'User'}
                            </p>
                            <p className="text-xs text-text-secondary capitalize">
                                {profile?.role || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {filteredMenu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${isActive
                                    ? 'gradient-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-text-secondary hover:text-primary hover:bg-surface-light'
                                }
              `}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Version */}
                <div className="absolute bottom-4 left-0 right-0 px-4">
                    <div className="text-center text-xs text-text-secondary">
                        © 2024 SIPELSAN
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
