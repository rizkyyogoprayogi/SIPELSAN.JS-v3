import { Menu, LogOut, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

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
        <header className="h-16 glass border-b border-border sticky top-0 z-30">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-surface-light transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="hidden md:block">
                        <h2 className="text-lg font-semibold text-white">
                            Selamat Datang, {profile?.nama?.split(' ')[0] || 'User'}
                        </h2>
                        <p className="text-sm text-text-secondary">
                            Sistem Manajemen Pelanggaran Santriwati
                        </p>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg text-text-secondary hover:text-white hover:bg-surface-light transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
                    </button>

                    {/* Logout */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        icon={LogOut}
                    >
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default Navbar
