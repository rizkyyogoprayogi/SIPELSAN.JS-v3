import { Menu, LogOut, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const Navbar = ({ onMenuClick }) => {
    const { signOut, profile } = useAuth()

    const handleLogout = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left side - Logo & Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <img
                            src="/logo_sekolah_dhputri.png"
                            alt="Logo Sekolah"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="hidden sm:block">
                            <h2 className="text-base font-bold text-gray-800 leading-tight">
                                Sistem Pencatatan Pelanggaran
                            </h2>
                            <p className="text-xs text-gray-500">
                                Bagian Disiplin Pengasuhan Santriwati
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Navbar
