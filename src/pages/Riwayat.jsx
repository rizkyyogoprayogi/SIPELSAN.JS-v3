import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { Search, Calendar, Eye, Image } from 'lucide-react'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { formatDate, formatShortDate } from '../utils/formatDate'

const Riwayat = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedDetail, setSelectedDetail] = useState(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [startDate, endDate])

    const fetchData = async () => {
        try {
            let query = supabase
                .from('pelanggaran')
                .select(`
          *,
          santriwati:santriwati_id (nis, nama, kelas:kelas_id(nama_kelas)),
          master_pelanggaran:pelanggaran_id (nama_pelanggaran, kategori, poin),
          created_by_profile:created_by (nama)
        `)
                .order('created_at', { ascending: false })

            if (startDate) {
                query = query.gte('tanggal', startDate)
            }
            if (endDate) {
                query = query.lte('tanggal', endDate)
            }

            const { data, error } = await query

            if (error) throw error
            setData(data || [])
        } catch (error) {
            console.error('Error fetching riwayat:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetail = (item) => {
        setSelectedDetail(item)
        setIsDetailModalOpen(true)
    }

    const filteredData = data.filter(item => {
        const santriwatiName = item.santriwati?.nama?.toLowerCase() || ''
        const santriwatiNis = item.santriwati?.nis?.toLowerCase() || ''
        const pelanggaranName = item.master_pelanggaran?.nama_pelanggaran?.toLowerCase() || ''
        const search = searchTerm.toLowerCase()

        return santriwatiName.includes(search) ||
            santriwatiNis.includes(search) ||
            pelanggaranName.includes(search)
    })

    const getKategoriBadge = (kategori) => {
        const styles = {
            ringan: 'bg-success/20 text-success',
            sedang: 'bg-warning/20 text-warning',
            berat: 'bg-danger/20 text-danger'
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[kategori]}`}>
                {kategori}
            </span>
        )
    }

    const columns = [
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
                    <p className="text-xs text-text-secondary">
                        {row.santriwati?.nis} • {row.santriwati?.kelas?.nama_kelas || '-'}
                    </p>
                </div>
            )
        },
        {
            header: 'Pelanggaran',
            render: (row) => (
                <div>
                    <p className="text-white">{row.master_pelanggaran?.nama_pelanggaran || '-'}</p>
                    <div className="flex items-center gap-2 mt-1">
                        {getKategoriBadge(row.master_pelanggaran?.kategori)}
                        <span className="text-xs text-primary font-medium">
                            +{row.master_pelanggaran?.poin} poin
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Bukti',
            width: '80px',
            render: (row) => row.bukti_url ? (
                <a
                    href={row.bukti_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 inline-flex rounded-lg text-primary hover:bg-primary/10 transition-colors"
                >
                    <Image className="h-4 w-4" />
                </a>
            ) : (
                <span className="text-text-secondary text-sm">-</span>
            )
        },
        {
            header: 'Aksi',
            width: '80px',
            render: (row) => (
                <button
                    onClick={() => handleViewDetail(row)}
                    className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                    <Eye className="h-4 w-4" />
                </button>
            )
        }
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Riwayat Pelanggaran</h1>
                <p className="text-text-secondary">Daftar semua pelanggaran yang tercatat</p>
            </div>

            {/* Content */}
            <Card noPadding>
                {/* Filters */}
                <div className="p-4 border-b border-border space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                icon={Search}
                                placeholder="Cari berdasarkan nama, NIS, atau pelanggaran..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-text-secondary" />
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <span className="flex items-center text-text-secondary">s/d</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-40"
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <span>Total: <strong className="text-white">{filteredData.length}</strong> pelanggaran</span>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate('') }}
                                className="text-primary hover:underline"
                            >
                                Reset filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={filteredData}
                    loading={loading}
                    emptyMessage="Belum ada riwayat pelanggaran"
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Pelanggaran"
            >
                {selectedDetail && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-text-secondary">Tanggal</p>
                                <p className="text-white">{formatDate(selectedDetail.tanggal)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">Dicatat oleh</p>
                                <p className="text-white">{selectedDetail.created_by_profile?.nama || '-'}</p>
                            </div>
                        </div>

                        <hr className="border-border" />

                        <div>
                            <p className="text-xs text-text-secondary">Santriwati</p>
                            <p className="font-medium text-white">{selectedDetail.santriwati?.nama}</p>
                            <p className="text-sm text-text-secondary">
                                {selectedDetail.santriwati?.nis} • {selectedDetail.santriwati?.kelas?.nama_kelas}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-text-secondary">Pelanggaran</p>
                            <p className="font-medium text-white">{selectedDetail.master_pelanggaran?.nama_pelanggaran}</p>
                            <div className="flex items-center gap-2 mt-1">
                                {getKategoriBadge(selectedDetail.master_pelanggaran?.kategori)}
                                <span className="text-primary font-medium">
                                    +{selectedDetail.master_pelanggaran?.poin} poin
                                </span>
                            </div>
                        </div>

                        {selectedDetail.keterangan && (
                            <div>
                                <p className="text-xs text-text-secondary">Keterangan</p>
                                <p className="text-white">{selectedDetail.keterangan}</p>
                            </div>
                        )}

                        {selectedDetail.bukti_url && (
                            <div>
                                <p className="text-xs text-text-secondary mb-2">Bukti</p>
                                {selectedDetail.bukti_url.includes('.pdf') ? (
                                    <a
                                        href={selectedDetail.bukti_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-primary hover:underline"
                                    >
                                        <Image className="h-4 w-4" />
                                        Lihat PDF
                                    </a>
                                ) : (
                                    <img
                                        src={selectedDetail.bukti_url}
                                        alt="Bukti"
                                        className="max-h-60 rounded-lg"
                                    />
                                )}
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="w-full"
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default Riwayat
