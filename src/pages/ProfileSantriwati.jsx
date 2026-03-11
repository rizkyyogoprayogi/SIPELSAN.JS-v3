import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { ArrowLeft, User, GraduationCap, AlertTriangle, Eye, Home, Phone, MapPin, Users } from 'lucide-react'
import Card from '../components/ui/Card'

const ProfileSantriwati = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [santriwati, setSantriwati] = useState(null)
    const [pelanggaran, setPelanggaran] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchSantriwati()
            fetchPelanggaran()
        }
    }, [id])

    const fetchSantriwati = async () => {
        try {
            const { data, error } = await supabase
                .from('santriwati')
                .select(`
                    *,
                    kelas:kelas_id (nama_kelas)
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setSantriwati(data)
        } catch (error) {
            console.error('Error fetching santriwati:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPelanggaran = async () => {
        try {
            const { data, error } = await supabase
                .from('pelanggaran')
                .select(`
                    *,
                    master_pelanggaran:pelanggaran_id (nama_pelanggaran, kategori, poin),
                    created_by_profile:created_by (nama)
                `)
                .eq('santriwati_id', id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPelanggaran(data || [])
        } catch (error) {
            console.error('Error fetching pelanggaran:', error)
        }
    }

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

    const getPoinColor = (poin) => {
        if (poin >= 100) return 'text-red-600'
        if (poin >= 50) return 'text-yellow-600'
        return 'text-green-600'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10 text-indigo-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-gray-500">Memuat profil...</p>
                </div>
            </div>
        )
    }

    if (!santriwati) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-gray-500">Data santriwati tidak ditemukan</p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-indigo-600 hover:underline text-sm"
                >
                    Kembali
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali
            </button>

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-white">
                            <h1 className="text-2xl font-bold">{santriwati.nama}</h1>
                            <p className="text-white/80 text-sm mt-0.5">NIS: {santriwati.nis}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                    <div className="p-4 sm:p-5 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Kelas</p>
                        </div>
                        <p className="text-lg font-bold text-gray-800">{santriwati.kelas?.nama_kelas || '-'}</p>
                    </div>
                    <div className="p-4 sm:p-5 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-gray-400" />
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Poin</p>
                        </div>
                        <p className={`text-lg font-bold ${getPoinColor(santriwati.total_poin)}`}>
                            {santriwati.total_poin}
                        </p>
                    </div>
                    <div className="p-4 sm:p-5 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Jumlah Pelanggaran</p>
                        <p className="text-lg font-bold text-gray-800">{pelanggaran.length}</p>
                    </div>
                    <div className="p-4 sm:p-5 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${santriwati.total_poin >= 100
                            ? 'bg-red-100 text-red-700'
                            : santriwati.total_poin >= 50
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                            {santriwati.total_poin >= 100 ? 'Kritis' : santriwati.total_poin >= 50 ? 'Perhatian' : 'Baik'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Ringkasan Kategori Pelanggaran */}
            <Card title="Ringkasan Kategori Pelanggaran">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                    <div className="flex items-center gap-4 pt-4 sm:pt-0 first:pt-0 sm:px-4 first:sm:pl-0 last:sm:pr-0">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pelanggaran Ringan</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {pelanggaran.filter(p => p.master_pelanggaran?.kategori === 'ringan').length}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pelanggaran Sedang</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {pelanggaran.filter(p => p.master_pelanggaran?.kategori === 'sedang').length}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pelanggaran Berat</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {pelanggaran.filter(p => p.master_pelanggaran?.kategori === 'berat').length}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Informasi Pribadi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Asrama & Kontak Pribadi" className="h-full">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                <Home className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Asrama / Kamar</p>
                                <p className="text-gray-900 font-semibold">
                                    {santriwati.asrama || '-'}
                                    {santriwati.nomor_kamar ? ` (Kamar: ${santriwati.nomor_kamar})` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Nama Orang Tua / Wali</p>
                                <p className="text-gray-900 font-semibold">{santriwati.nama_ortu || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">No. Handphone Ortu / Wali</p>
                                <p className="text-gray-900 font-semibold">{santriwati.no_hp_ortu || '-'}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Alamat Tempat Tinggal" className="h-full">
                    <div className="flex items-start gap-3 h-full">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                            <MapPin className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 mb-1">Alamat Lengkap</p>
                            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {santriwati.alamat || 'Belum ada data alamat.'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pelanggaran Table */}
            <Card title="Riwayat Pelanggaran" subtitle={`${pelanggaran.length} pelanggaran tercatat`}>
                {pelanggaran.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">Belum ada pelanggaran tercatat</p>
                ) : (
                    <div className="overflow-x-auto -mx-6">
                        <p className="sm:hidden text-xs text-gray-400 px-6 pb-2">← Geser untuk melihat data lengkap →</p>
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pelanggaran</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tingkat</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Poin</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Keterangan</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pelapor</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bukti</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pelanggaran.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-6">
                                            <p className="text-sm text-gray-800">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {item.created_at ? new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-800">{item.master_pelanggaran?.nama_pelanggaran || '-'}</p>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {getTingkatBadge(item.master_pelanggaran?.kategori)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="text-sm font-bold text-gray-800">+{item.master_pelanggaran?.poin || 0}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{item.keterangan || '-'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{item.created_by_profile?.nama || '-'}</p>
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

export default ProfileSantriwati
