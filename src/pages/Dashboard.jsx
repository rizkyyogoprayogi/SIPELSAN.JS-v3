import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import {
    Users,
    AlertTriangle,
    FileText,
    TrendingUp,
    ArrowUp,
    ArrowDown
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
    LineChart,
    Line
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

    const COLORS = ['#10b981', '#f59e0b', '#ef4444']

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            // Fetch total santriwati
            const { count: santriwatiCount } = await supabase
                .from('santriwati')
                .select('*', { count: 'exact', head: true })

            // Fetch total pelanggaran
            const { count: pelanggaranCount } = await supabase
                .from('pelanggaran')
                .select('*', { count: 'exact', head: true })

            // Fetch pelanggaran bulan ini
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { count: pelanggaranBulanIni } = await supabase
                .from('pelanggaran')
                .select('*', { count: 'exact', head: true })
                .gte('tanggal', startOfMonth.toISOString().split('T')[0])

            // Fetch surat bulan ini
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

            // Fetch data for charts
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
            color: 'from-blue-500 to-blue-600',
            trend: null
        },
        {
            title: 'Total Pelanggaran',
            value: stats.totalPelanggaran,
            icon: AlertTriangle,
            color: 'from-orange-500 to-orange-600',
            trend: null
        },
        {
            title: 'Pelanggaran Bulan Ini',
            value: stats.pelanggaranBulanIni,
            icon: TrendingUp,
            color: 'from-red-500 to-red-600',
            trend: 'up'
        },
        {
            title: 'Surat Bulan Ini',
            value: stats.totalSuratBulanIni,
            icon: FileText,
            color: 'from-purple-500 to-purple-600',
            trend: null
        }
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-text-secondary">Memuat dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-text-secondary">Ringkasan data pelanggaran santriwati</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="glass rounded-xl p-5 animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-text-secondary text-sm">{stat.title}</p>
                                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        {stat.trend && (
                            <div className="flex items-center gap-1 mt-3">
                                {stat.trend === 'up' ? (
                                    <ArrowUp className="h-4 w-4 text-danger" />
                                ) : (
                                    <ArrowDown className="h-4 w-4 text-success" />
                                )}
                                <span className={`text-sm ${stat.trend === 'up' ? 'text-danger' : 'text-success'}`}>
                                    vs bulan lalu
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Chart */}
                <Card title="Trend Pelanggaran" subtitle="6 bulan terakhir">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="pelanggaran" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Category Pie Chart */}
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
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Top Pelanggar */}
            <Card title="Top 5 Pelanggar" subtitle="Santriwati dengan poin tertinggi">
                <div className="space-y-3">
                    {topPelanggar.length === 0 ? (
                        <p className="text-text-secondary text-center py-8">Belum ada data</p>
                    ) : (
                        topPelanggar.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 rounded-lg bg-surface-light/30 hover:bg-surface-light/50 transition-colors"
                            >
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-yellow-500 text-black' :
                                        index === 1 ? 'bg-gray-300 text-black' :
                                            index === 2 ? 'bg-orange-600 text-white' :
                                                'bg-surface-light text-text-secondary'}
                `}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{item.nama}</p>
                                    <p className="text-sm text-text-secondary">
                                        {item.nis} • {item.kelas?.nama_kelas || '-'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-danger">{item.total_poin}</p>
                                    <p className="text-xs text-text-secondary">poin</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    )
}

export default Dashboard
