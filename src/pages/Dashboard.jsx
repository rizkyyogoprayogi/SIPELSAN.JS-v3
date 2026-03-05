import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import {
    Users,
    AlertTriangle,
    FileText,
    TrendingUp,
    Search,
} from 'lucide-react'
import Card from '../components/ui/Card'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts'

const Dashboard = () => {
    const { profile } = useAuth()
    const [stats, setStats] = useState({
        totalSantriwati: 0,
        totalPelanggaran: 0,
        totalSuratBulanIni: 0,
        pelanggaranBulanIni: 0
    })
    const [monthlyData, setMonthlyData] = useState([])
    const [categoryData, setCategoryData] = useState([])
    const [topPelanggar, setTopPelanggar] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const COLORS = ['#10b981', '#f59e0b', '#ef4444']

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const { count: santriwatiCount } = await supabase
                .from('santriwati')
                .select('*', { count: 'exact', head: true })

            const { count: pelanggaranCount } = await supabase
                .from('pelanggaran')
                .select('*', { count: 'exact', head: true })

            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { count: pelanggaranBulanIni } = await supabase
                .from('pelanggaran')
                .select('*', { count: 'exact', head: true })
                .gte('tanggal', startOfMonth.toISOString().split('T')[0])

            const { count: suratBulanIni } = await supabase
                .from('surat')
                .select('*', { count: 'exact', head: true })
                .gte('tanggal', startOfMonth.toISOString().split('T')[0])

            setStats({
                totalSantriwati: santriwatiCount || 0,
                totalPelanggaran: pelanggaranCount || 0,
                totalSuratBulanIni: suratBulanIni || 0,
                pelanggaranBulanIni: pelanggaranBulanIni || 0
            })

            await fetchMonthlyData()
            await fetchCategoryData()
            await fetchTopPelanggar()

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchMonthlyData = async () => {
        const months = []
        const now = new Date()

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

            const { count } = await supabase
                .from('pelanggaran')
                .select('*', { count: 'exact', head: true })
                .gte('tanggal', date.toISOString().split('T')[0])
                .lte('tanggal', endDate.toISOString().split('T')[0])

            months.push({
                name: date.toLocaleDateString('id-ID', { month: 'short' }),
                pelanggaran: count || 0
            })
        }

        setMonthlyData(months)
    }

    const fetchCategoryData = async () => {
        const { data } = await supabase
            .from('pelanggaran')
            .select(`
                master_pelanggaran (kategori)
            `)

        if (data) {
            const categoryCounts = data.reduce((acc, item) => {
                const cat = item.master_pelanggaran?.kategori || 'lainnya'
                acc[cat] = (acc[cat] || 0) + 1
                return acc
            }, {})

            setCategoryData([
                { name: 'Ringan', value: categoryCounts['ringan'] || 0 },
                { name: 'Sedang', value: categoryCounts['sedang'] || 0 },
                { name: 'Berat', value: categoryCounts['berat'] || 0 }
            ])
        }
    }

    const fetchTopPelanggar = async () => {
        const { data } = await supabase
            .from('santriwati')
            .select('id, nis, nama, total_poin, kelas:kelas_id(nama_kelas)')
            .order('total_poin', { ascending: false })
            .limit(5)

        if (data) {
            setTopPelanggar(data)
        }
    }

    const statCards = [
        {
            title: 'Total Santriwati',
            value: stats.totalSantriwati,
            icon: Users,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            borderColor: 'border-l-blue-500',
        },
        {
            title: 'Total Pelanggaran',
            value: stats.totalPelanggaran,
            icon: AlertTriangle,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            borderColor: 'border-l-orange-500',
        },
        {
            title: 'Pelanggaran Bulan Ini',
            value: stats.pelanggaranBulanIni,
            icon: TrendingUp,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            borderColor: 'border-l-red-500',
        },
        {
            title: 'Surat Bulan Ini',
            value: stats.totalSuratBulanIni,
            icon: FileText,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            borderColor: 'border-l-purple-500',
        }
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10 text-indigo-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-gray-500">Memuat dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Ringkasan data pelanggaran</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari santriwati atau NISN..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-gray-800 placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 ${stat.borderColor} hover:shadow-md transition-shadow`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Bar Chart */}
                <Card title="Trend Pelanggaran" subtitle="6 bulan terakhir">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                        color: '#1e293b'
                                    }}
                                />
                                <Bar dataKey="pelanggaran" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Pie Chart */}
                <Card title="Kategori Pelanggaran" subtitle="Distribusi berdasarkan tingkat">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                        color: '#1e293b'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-6 mt-2 pt-4 border-t border-gray-100">
                        {categoryData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                <span className="text-sm text-gray-600">{item.name}: <strong>{item.value}</strong></span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Top Pelanggar */}
            <Card title="Top 5 Pelanggar" subtitle="Santriwati dengan poin tertinggi">
                {topPelanggar.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">Belum ada data pelanggaran</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">#</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">NIS</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Kelas</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Poin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topPelanggar.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                    >
                                        <td className="py-3 px-4">
                                            <span className={`
                                                inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-600' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-50 text-gray-500'}
                                            `}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-800 text-sm">{item.nama}</p>
                                            <p className="text-xs text-gray-400 sm:hidden">{item.nis} • {item.kelas?.nama_kelas || '-'}</p>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 hidden sm:table-cell">{item.nis}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600 hidden sm:table-cell">{item.kelas?.nama_kelas || '-'}</td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                                                {item.total_poin} poin
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default Dashboard
