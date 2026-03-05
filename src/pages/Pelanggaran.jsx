import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { Search, Plus, Edit2, Trash2, Image, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Pelanggaran = () => {
    const { canInput, canManage } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterPeriod, setFilterPeriod] = useState('semua')
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    useEffect(() => {
        fetchData()
    }, [filterPeriod])

    const fetchData = async () => {
        try {
            setLoading(true)
            let query = supabase
                .from('pelanggaran')
                .select(`
                    *,
                    santriwati:santriwati_id (nis, nama, kelas:kelas_id(nama_kelas)),
                    master_pelanggaran:pelanggaran_id (nama_pelanggaran, kategori, poin),
                    created_by_profile:created_by (nama)
                `)
                .order('created_at', { ascending: false })

            // Apply period filter
            const now = new Date()
            if (filterPeriod === 'hari') {
                const today = now.toISOString().split('T')[0]
                query = query.eq('tanggal', today)
            } else if (filterPeriod === 'minggu') {
                const startOfWeek = new Date(now)
                startOfWeek.setDate(now.getDate() - now.getDay())
                query = query.gte('tanggal', startOfWeek.toISOString().split('T')[0])
            }

            const { data: result, error } = await query
            if (error) throw error
            setData(result || [])
        } catch (error) {
            console.error('Error fetching pelanggaran:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('pelanggaran')
                .delete()
                .eq('id', id)
            if (error) throw error
            setDeleteConfirm(null)
            fetchData()
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    const filteredData = data.filter(item => {
        const nama = item.santriwati?.nama?.toLowerCase() || ''
        const nis = item.santriwati?.nis?.toLowerCase() || ''
        const pelanggaran = item.master_pelanggaran?.nama_pelanggaran?.toLowerCase() || ''
        const search = searchTerm.toLowerCase()
        return nama.includes(search) || nis.includes(search) || pelanggaran.includes(search)
    })

    const getTingkatBadge = (kategori) => {
        const styles = {
            ringan: 'bg-green-100 text-green-700',
            sedang: 'bg-yellow-100 text-yellow-700',
            berat: 'bg-red-100 text-red-700'
        }
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${styles[kategori] || 'bg-gray-100 text-gray-600'}`}>
                {kategori || '-'}
            </span>
        )
    }

    const formatTanggal = (tanggal, createdAt) => {
        if (!tanggal) return '-'
        const date = new Date(tanggal)
        const day = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
        const year = date.getFullYear()
        const time = createdAt ? new Date(createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''
        return (
            <div>
                <p className="text-sm text-gray-800">{day}</p>
                <p className="text-xs text-gray-400">{year} {time}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 overflow-hidden">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Title & Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800">Riwayat Pelanggaran</h1>
                        <div className="flex items-center gap-2">
                            {['hari', 'minggu', 'semua'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setFilterPeriod(period)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterPeriod === period
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {period === 'hari' ? 'Hari Ini' : period === 'minggu' ? 'Minggu Ini' : 'Semua'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari santri/NIS..."
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-800 placeholder:text-gray-400"
                            />
                        </div>

                        {canInput && (
                            <button
                                onClick={() => navigate('/input-pelanggaran')}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Catat Pelanggaran</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Scroll hint for mobile */}
                <p className="sm:hidden text-xs text-gray-400 px-4 py-2 bg-gray-50 border-b border-gray-100">← Geser tabel ke kanan untuk melihat data lengkap →</p>
                <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Santri</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pelanggaran</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Perbaikan</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tingkat</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Poin</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bukti</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pelapor</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Terakhir Edit</th>
                                {canInput && (
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={canInput ? 10 : 9} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <p className="text-gray-400 text-sm">Memuat data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={canInput ? 10 : 9} className="py-16 text-center text-gray-400">
                                        Belum ada data pelanggaran
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4">
                                            {formatTanggal(item.tanggal, item.created_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm font-medium text-gray-800">{item.santriwati?.nama || '-'}</p>
                                            <p className="text-xs text-gray-400">{item.santriwati?.kelas?.nama_kelas || '-'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-800">{item.master_pelanggaran?.nama_pelanggaran || '-'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{item.keterangan || '-'}</p>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {getTingkatBadge(item.master_pelanggaran?.kategori)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="text-sm font-bold text-gray-800">{item.master_pelanggaran?.poin || 0}</span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {item.bukti_url ? (
                                                <a
                                                    href={item.bukti_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{item.created_by_profile?.nama || '-'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-xs text-gray-400">-</p>
                                        </td>
                                        {canInput && (
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors">
                                                        Edit
                                                    </button>
                                                    {canManage && (
                                                        <>
                                                            {deleteConfirm === item.id ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleDelete(item.id)}
                                                                        className="px-2 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                                                                    >
                                                                        Ya
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteConfirm(null)}
                                                                        className="px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                                                                    >
                                                                        Batal
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setDeleteConfirm(item.id)}
                                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && filteredData.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-sm text-gray-500">
                            Menampilkan <strong className="text-gray-700">{filteredData.length}</strong> data pelanggaran
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Pelanggaran
