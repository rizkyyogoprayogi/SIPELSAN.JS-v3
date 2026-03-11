import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { History, Search, Calendar, User, Tag, Clock } from 'lucide-react'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Input from '../components/ui/Input'

const LogAktivitas = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterAksi, setFilterAksi] = useState('Semua')

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('log_aktivitas')
                .select(`
                    *,
                    profiles:user_id (nama, role)
                `)
                .order('created_at', { ascending: false })
                .limit(200)

            if (error) throw error
            setData(data || [])
        } catch (error) {
            console.error('Error fetching logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const getAksiBadge = (aksi) => {
        const badges = {
            'TAMBAH': 'bg-blue-100 text-blue-700',
            'EDIT': 'bg-orange-100 text-orange-700',
            'HAPUS': 'bg-red-100 text-red-700'
        }
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${badges[aksi] || 'bg-gray-100 text-gray-700'}`}>
                {aksi}
            </span>
        )
    }

    const columns = [
        {
            header: 'Waktu',
            width: '180px',
            render: (row) => {
                const date = new Date(row.created_at)
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">
                            {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                        </span>
                    </div>
                )
            }
        },
        {
            header: 'User / Aktor',
            width: '200px',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{row.profiles?.nama || 'Unknown'}</span>
                    <span className="text-xs text-gray-500 capitalize">{row.profiles?.role || '-'}</span>
                </div>
            )
        },
        {
            header: 'Aksi & Entitas',
            width: '200px',
            render: (row) => (
                <div className="flex flex-col items-start gap-1.5">
                    {getAksiBadge(row.aksi)}
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {row.entitas}
                    </span>
                </div>
            )
        },
        {
            header: 'Keterangan Detail',
            render: (row) => (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{row.keterangan || '-'}</p>
            )
        }
    ]

    const filteredData = data.filter(item => {
        const matchesSearch =
            (item.keterangan?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (item.profiles?.nama?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (item.entitas?.toLowerCase() || '').includes(searchTerm.toLowerCase())

        const matchesAksi = filterAksi === 'Semua' || item.aksi === filterAksi

        return matchesSearch && matchesAksi
    })

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    Log Aktivitas Sistem
                </h1>
                <p className="text-text-secondary mt-1">Pantau seluruh catatan perubahan data yang dilakukan oleh pengguna</p>
            </div>

            {/* Content */}
            <Card noPadding>
                {/* Filters */}
                <div className="p-4 border-b border-border bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="w-full md:w-96">
                        <Input
                            icon={Search}
                            placeholder="Cari berdasarkan nama, aktivitas, atau entitas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['Semua', 'TAMBAH', 'EDIT', 'HAPUS'].map((aksi) => (
                            <button
                                key={aksi}
                                onClick={() => setFilterAksi(aksi)}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all whitespace-nowrap
                                ${filterAksi === aksi
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {aksi === 'Semua' ? 'Semua Aksi' : aksi}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={filteredData}
                    loading={loading}
                    emptyMessage="Belum ada aktivitas yang dicatat"
                />
            </Card>
        </div>
    )
}

export default LogAktivitas
