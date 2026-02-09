import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { FileText, Download, Search, CheckCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { formatDate, formatShortDate } from '../utils/formatDate'
import { generateSuratPeringatan, downloadPdf, getPdfBlob } from '../utils/generatePdf'

const GenerateSurat = () => {
    const { user } = useAuth()
    const [santriwatiList, setSantriwatiList] = useState([])
    const [suratHistory, setSuratHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSantriwati, setSelectedSantriwati] = useState(null)
    const [pelanggaranList, setPelanggaranList] = useState([])
    const [generating, setGenerating] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [santriwatiRes, suratRes] = await Promise.all([
                supabase
                    .from('santriwati')
                    .select('id, nis, nama, total_poin, kelas:kelas_id(nama_kelas)')
                    .order('total_poin', { ascending: false }),
                supabase
                    .from('surat')
                    .select(`
            *,
            santriwati:santriwati_id (nis, nama),
            created_by_profile:created_by (nama)
          `)
                    .order('created_at', { ascending: false })
                    .limit(20)
            ])

            setSantriwatiList(santriwatiRes.data || [])
            setSuratHistory(suratRes.data || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPelanggaran = async (santriwatiId) => {
        const { data } = await supabase
            .from('pelanggaran')
            .select(`
        *,
        master_pelanggaran:pelanggaran_id (nama_pelanggaran, poin)
      `)
            .eq('santriwati_id', santriwatiId)
            .order('tanggal', { ascending: false })
            .limit(10)

        setPelanggaranList(data || [])
    }

    const handleGenerateSurat = (santriwati) => {
        setSelectedSantriwati(santriwati)
        fetchPelanggaran(santriwati.id)
        setIsModalOpen(true)
    }

    const getJenisSurat = (totalPoin) => {
        if (totalPoin >= 100) return 'SP3'
        if (totalPoin >= 50) return 'SP2'
        return 'SP1'
    }

    const handleConfirmGenerate = async () => {
        if (!selectedSantriwati) return

        setGenerating(true)
        try {
            const jenisSurat = getJenisSurat(selectedSantriwati.total_poin)
            const tanggal = formatDate(new Date())

            // Generate PDF
            const doc = generateSuratPeringatan({
                santriwati: selectedSantriwati,
                jenisSurat,
                totalPoin: selectedSantriwati.total_poin,
                pelanggaran: pelanggaranList.map(p => ({
                    nama_pelanggaran: p.master_pelanggaran?.nama_pelanggaran,
                    poin: p.master_pelanggaran?.poin
                })),
                tanggal
            })

            // Get blob for upload
            const blob = getPdfBlob(doc)
            const fileName = `${jenisSurat}_${selectedSantriwati.nis}_${Date.now()}.pdf`
            const filePath = `surat/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('pelanggaran')
                .upload(filePath, blob)

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage
                .from('pelanggaran')
                .getPublicUrl(filePath)

            // Save to database
            const { error: insertError } = await supabase
                .from('surat')
                .insert({
                    santriwati_id: selectedSantriwati.id,
                    jenis_surat: jenisSurat,
                    tanggal: new Date().toISOString().split('T')[0],
                    file_url: urlData.publicUrl,
                    created_by: user.id
                })

            if (insertError) throw insertError

            // Download the PDF
            downloadPdf(doc, fileName)

            setSuccess(true)
            setIsModalOpen(false)
            fetchData()

            setTimeout(() => setSuccess(false), 3000)

        } catch (error) {
            console.error('Error generating surat:', error)
        } finally {
            setGenerating(false)
        }
    }

    const filteredSantriwati = santriwatiList.filter(item =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nis.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Only show santriwati with points > 0
    const eligibleSantriwati = filteredSantriwati.filter(s => s.total_poin > 0)

    const getSuratBadge = (jenis) => {
        const styles = {
            SP1: 'bg-warning/20 text-warning',
            SP2: 'bg-orange-500/20 text-orange-400',
            SP3: 'bg-danger/20 text-danger'
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[jenis]}`}>
                {jenis}
            </span>
        )
    }

    const santriwatiColumns = [
        {
            header: 'Santriwati',
            render: (row) => (
                <div>
                    <p className="font-medium text-white">{row.nama}</p>
                    <p className="text-xs text-text-secondary">
                        {row.nis} • {row.kelas?.nama_kelas || '-'}
                    </p>
                </div>
            )
        },
        {
            header: 'Total Poin',
            width: '100px',
            render: (row) => (
                <span className={`text-lg font-bold ${row.total_poin >= 100 ? 'text-danger' :
                        row.total_poin >= 50 ? 'text-warning' :
                            'text-success'
                    }`}>
                    {row.total_poin}
                </span>
            )
        },
        {
            header: 'Rekomendasi',
            width: '100px',
            render: (row) => getSuratBadge(getJenisSurat(row.total_poin))
        },
        {
            header: 'Aksi',
            width: '150px',
            render: (row) => (
                <Button
                    size="sm"
                    onClick={() => handleGenerateSurat(row)}
                    icon={FileText}
                >
                    Generate
                </Button>
            )
        }
    ]

    const historyColumns = [
        {
            header: 'Tanggal',
            width: '120px',
            render: (row) => formatShortDate(row.tanggal)
        },
        {
            header: 'Santriwati',
            render: (row) => (
                <div>
                    <p className="font-medium text-white">{row.santriwati?.nama || '-'}</p>
                    <p className="text-xs text-text-secondary">{row.santriwati?.nis}</p>
                </div>
            )
        },
        {
            header: 'Jenis',
            width: '80px',
            render: (row) => getSuratBadge(row.jenis_surat)
        },
        {
            header: 'Dibuat oleh',
            render: (row) => row.created_by_profile?.nama || '-'
        },
        {
            header: 'Download',
            width: '100px',
            render: (row) => row.file_url ? (
                <a
                    href={row.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                >
                    <Download className="h-4 w-4" />
                    PDF
                </a>
            ) : '-'
        }
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Generate Surat Peringatan</h1>
                <p className="text-text-secondary">Buat surat peringatan otomatis berdasarkan akumulasi poin</p>
            </div>

            {/* Success Alert */}
            {success && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30 flex items-center gap-3 animate-slide-up">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-success">Surat peringatan berhasil dibuat dan didownload!</span>
                </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4 border-l-4 border-warning">
                    <p className="text-sm text-text-secondary">SP1 (Peringatan 1)</p>
                    <p className="text-lg font-semibold text-white">1 - 49 poin</p>
                </div>
                <div className="glass rounded-xl p-4 border-l-4 border-orange-500">
                    <p className="text-sm text-text-secondary">SP2 (Peringatan 2)</p>
                    <p className="text-lg font-semibold text-white">50 - 99 poin</p>
                </div>
                <div className="glass rounded-xl p-4 border-l-4 border-danger">
                    <p className="text-sm text-text-secondary">SP3 (Peringatan 3)</p>
                    <p className="text-lg font-semibold text-white">≥ 100 poin</p>
                </div>
            </div>

            {/* Eligible Santriwati */}
            <Card
                title="Santriwati yang Dapat Dibuatkan Surat"
                subtitle="Daftar santriwati yang memiliki poin pelanggaran"
                noPadding
            >
                <div className="p-4 border-b border-border">
                    <Input
                        icon={Search}
                        placeholder="Cari berdasarkan nama atau NIS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Table
                    columns={santriwatiColumns}
                    data={eligibleSantriwati}
                    loading={loading}
                    emptyMessage="Belum ada santriwati dengan poin pelanggaran"
                />
            </Card>

            {/* History */}
            <Card
                title="Riwayat Surat"
                subtitle="Surat peringatan yang pernah dibuat"
                noPadding
            >
                <Table
                    columns={historyColumns}
                    data={suratHistory}
                    loading={loading}
                    emptyMessage="Belum ada riwayat surat"
                />
            </Card>

            {/* Generate Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Konfirmasi Generate Surat"
            >
                {selectedSantriwati && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-surface-light/50">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="font-semibold text-white">{selectedSantriwati.nama}</p>
                                    <p className="text-sm text-text-secondary">
                                        {selectedSantriwati.nis} • {selectedSantriwati.kelas?.nama_kelas}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-danger">{selectedSantriwati.total_poin}</p>
                                    <p className="text-xs text-text-secondary">poin</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                {getSuratBadge(getJenisSurat(selectedSantriwati.total_poin))}
                            </div>
                        </div>

                        {pelanggaranList.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-text-secondary mb-2">Riwayat Pelanggaran Terbaru:</p>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {pelanggaranList.map((p, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm p-2 rounded bg-surface-light/30">
                                            <span className="text-white">{p.master_pelanggaran?.nama_pelanggaran}</span>
                                            <span className="text-primary">+{p.master_pelanggaran?.poin}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-text-secondary text-sm">
                            Surat peringatan akan di-generate dalam format PDF dan otomatis tersimpan.
                        </p>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleConfirmGenerate}
                                loading={generating}
                                icon={FileText}
                            >
                                Generate & Download
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default GenerateSurat
