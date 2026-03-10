import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { ArrowLeft, BookOpen, Users, Phone, UserCircle2 } from 'lucide-react'

const ProfileKelas = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [kelas, setKelas] = useState(null)
    const [santriwatiList, setSantriwatiList] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchKelasData()
        }
    }, [id])

    const fetchKelasData = async () => {
        try {
            // 1. Fetch kelas info
            const { data: kelasData, error: kelasError } = await supabase
                .from('kelas')
                .select('*')
                .eq('id', id)
                .single()

            if (kelasError) throw kelasError
            setKelas(kelasData)

            // 2. Fetch santriwati in this kelas
            const { data: santriwatiData, error: santriwatiError } = await supabase
                .from('santriwati')
                .select('*')
                .eq('kelas_id', id)
                .order('nama', { ascending: true })

            if (santriwatiError) throw santriwatiError
            setSantriwatiList(santriwatiData || [])

        } catch (error) {
            console.error('Error fetching data kelas:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-500 text-sm">Memuat profil kelas...</p>
            </div>
        )
    }

    if (!kelas) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Kelas tidak ditemukan</h3>
                <button
                    onClick={() => navigate('/kelas')}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mt-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Data Kelas
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Navigasi Back */}
            <button
                onClick={() => navigate('/kelas')}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Data Kelas
            </button>

            {/* Header Profil Kelas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                <div className="px-6 sm:px-10 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6 gap-4">
                        <div className="flex gap-6 items-end">
                            {/* Avatar Kelas */}
                            <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-md shrink-0">
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center border border-indigo-100/50">
                                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        {kelas.nama_kelas?.substring(0, 2).replace(/\s/g, '').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="pb-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{kelas.nama_kelas}</h1>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${kelas.lembaga === 'SMA' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                        {kelas.lembaga || 'SMP'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Data Kelas & Wali Kelas</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats / Info Wali Kelas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-gray-100 rounded-xl bg-gray-50/50 p-4">
                        <div className="flex items-center gap-4 p-2">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                <UserCircle2 className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Wali Kelas</p>
                                <p className="font-semibold text-gray-900">{kelas.wali_kelas || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-2">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Nomor Handphone</p>
                                <p className="font-semibold text-gray-900">{kelas.nomor_hp || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Jumlah Santri</p>
                                <p className="font-semibold text-gray-900">{santriwatiList.length} Orang</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabel Santriwati */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex bg-gray-50/50 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Daftar Santriwati</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">No</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">NIS</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Santriwati</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Poin</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {santriwatiList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">
                                        Belum ada data santriwati di kelas ini
                                    </td>
                                </tr>
                            ) : (
                                santriwatiList.map((santri, index) => (
                                    <tr key={santri.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6 text-sm text-gray-500">{index + 1}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-gray-600">{santri.nis}</td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => navigate(`/santriwati/${santri.id}`)}
                                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors text-left"
                                            >
                                                {santri.nama}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                                                {santri.total_poin}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${santri.total_poin >= 100 ? 'bg-red-100 text-red-700' :
                                                    santri.total_poin >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {santri.total_poin >= 100 ? 'Kritis' : santri.total_poin >= 50 ? 'Perhatian' : 'Baik'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ProfileKelas
