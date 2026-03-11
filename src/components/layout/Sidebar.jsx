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
    UserCog,
    LogOut,
    X
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
    const { profile, signOut, canInput, canManage } = useAuth()

    const handleLogout = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

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
            show: canManage || canInput
        },
        {
            name: 'Kelas',
            path: '/kelas',
            icon: GraduationCap,
            show: canManage || canInput
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
            name: 'Pelanggaran',
            path: '/pelanggaran',
            icon: AlertTriangle,
            show: true
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
        },
        {
            name: 'Log Aktivitas',
            path: '/log-aktivitas',
            icon: History,
            show: canManage
        },
        {
            name: 'Manajemen User',
            path: '/manajemen-user',
            icon: UserCog,
            show: canManage
        }
    ]

    const filteredMenu = menuItems.filter(item => item.show)

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 right-0 lg:left-0 z-50
                w-64 bg-white border-l lg:border-l-0 lg:border-r border-gray-200
                transform transition-transform duration-300 ease-out
                flex flex-col
                ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-gray-800">SIPELSAN</h1>
                            <p className="text-[10px] text-gray-400 -mt-0.5">v3.0</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                            <span className="text-white font-semibold text-sm">
                                {profile?.nama?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                                {profile?.nama || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {profile?.role || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {filteredMenu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-lg
                                transition-all duration-200 text-sm
                                ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }
                            `}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer with Logout */}
                <div className="px-3 py-3 border-t border-gray-100 shrink-0 space-y-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="font-medium">Logout</span>
                    </button>
                    <p className="text-center text-[11px] text-gray-400">
                        © 2025 SIPELSAN
                    </p>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
