import { Menu, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

const Navbar = ({ onMenuClick }) => {
    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left side - Logo & Title */}
                <div className="flex items-center gap-3">
                    <img
                        src="/logo_sekolah_dhputri.png"
                        alt="Logo Sekolah"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">
                            Sistem Pencatatan Pelanggaran
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            Bagian Disiplin Pengasuhan Santriwati
                        </p>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <Link to="/log-aktivitas" className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </Link>

                    {/* Hamburger menu - mobile only, now on the right */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Navbar
