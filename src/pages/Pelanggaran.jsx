import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { Search, Plus, Edit2, Trash2, Image, Eye } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

const Pelanggaran = () => {
    const { canInput, canManage } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [pelanggaranList, setPelanggaranList] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterPeriod, setFilterPeriod] = useState('semua')
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        id: null,
        tanggal: '',
        waktu: '',
        keterangan: '',
        perbaikan: '',
        pelanggaran_id: ''
    })
    const [submitting, setSubmitting] = useState(false)

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

            const [resultRes, masterRes] = await Promise.all([
                query,
                supabase.from('master_pelanggaran').select('*').order('kategori').order('nama_pelanggaran')
            ])

            if (resultRes.error) throw resultRes.error
            if (masterRes.error) throw masterRes.error

            setData(resultRes.data || [])
            setPelanggaranList(masterRes.data || [])
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

    const handleEditClick = (item) => {
        setEditForm({
            id: item.id,
            tanggal: item.tanggal,
            waktu: item.waktu || '',
            keterangan: item.keterangan || '',
            perbaikan: item.perbaikan || '',
            pelanggaran_id: item.master_pelanggaran?.id || ''
        })
        setIsEditOpen(true)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            let updateData = {
                tanggal: editForm.tanggal,
                waktu: editForm.waktu || null,
                keterangan: editForm.keterangan || null,
                perbaikan: editForm.perbaikan || null
            }

            if (editForm.pelanggaran_id) {
                updateData.pelanggaran_id = editForm.pelanggaran_id
            }

            const { error } = await supabase
                .from('pelanggaran')
                .update(updateData)
                .eq('id', editForm.id)

            if (error) throw error

            setIsEditOpen(false)
            fetchData()
        } catch (error) {
            console.error('Error updating:', error)
            alert('Gagal mengupdate data. Silakan coba lagi.')
        } finally {
            setSubmitting(false)
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

    const formatTanggal = (tanggal, waktu, createdAt) => {
        if (!tanggal) return '-'
        const date = new Date(tanggal)
        const day = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
        const year = date.getFullYear()
        const displayTime = waktu ? waktu.slice(0, 5) : (createdAt ? new Date(createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '')
        return (
            <div>
                <p className="text-sm font-semibold text-gray-800">{displayTime || day}</p>
                <p className="text-xs text-gray-400">{displayTime ? day : year} {displayTime ? year : ''}</p>
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
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Waktu & Tanggal</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Santri</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pelanggaran</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide max-w-[200px]">Keterangan</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide max-w-[200px]">Tindakan Perbaikan</th>
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
                                    <td colSpan={canInput ? 11 : 10} className="py-16 text-center">
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
                                    <td colSpan={canInput ? 11 : 10} className="py-16 text-center text-gray-400">
                                        Belum ada data pelanggaran
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4">
                                            {formatTanggal(item.tanggal, item.waktu, item.created_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {item.santriwati ? (
                                                <Link
                                                    to={`/santriwati/${item.santriwati_id}`}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline inline-block"
                                                >
                                                    {item.santriwati.nama}
                                                </Link>
                                            ) : (
                                                <p className="text-sm font-medium text-gray-800">-</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-0.5">{item.santriwati?.kelas?.nama_kelas || '-'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-800">{item.master_pelanggaran?.nama_pelanggaran || '-'}</p>
                                        </td>
                                        <td className="py-3 px-4 max-w-[200px]">
                                            {item.keterangan ? (
                                                <p className="text-sm text-gray-600 line-clamp-2" title={item.keterangan}>
                                                    {item.keterangan}
                                                </p>
                                            ) : <span className="text-sm text-gray-400 italic">Tanpa keterangan</span>}
                                        </td>
                                        <td className="py-3 px-4 max-w-[200px]">
                                            {item.perbaikan ? (
                                                <p className="text-sm text-gray-600 line-clamp-2" title={item.perbaikan}>
                                                    {item.perbaikan}
                                                </p>
                                            ) : <span className="text-sm text-gray-400 italic">-</span>}
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
                                                    <button
                                                        onClick={() => handleEditClick(item)}
                                                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                                                    >
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

            {/* Modal Edit Pelanggaran */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-slide-up">
                        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Edit Pelanggaran</h2>
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Pilih Jenis Pelanggaran (Opsional jika ingin diubah)</label>
                                <select
                                    value={editForm.pelanggaran_id}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, pelanggaran_id: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="">-- Pertahankan Pelanggaran Sebelumnya --</option>
                                    {pelanggaranList.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nama_pelanggaran} ({p.poin} poin)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                                    <input
                                        type="date"
                                        required
                                        value={editForm.tanggal}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, tanggal: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Waktu</label>
                                    <input
                                        type="time"
                                        value={editForm.waktu}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, waktu: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Keterangan / Kronologi</label>
                                <textarea
                                    value={editForm.keterangan}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, keterangan: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Tindakan / Perbaikan</label>
                                <textarea
                                    value={editForm.perbaikan}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, perbaikan: e.target.value }))}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting && (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    )}
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Pelanggaran
