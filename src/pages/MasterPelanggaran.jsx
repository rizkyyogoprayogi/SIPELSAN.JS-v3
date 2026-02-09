import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'

const MasterPelanggaran = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterKategori, setFilterKategori] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [formData, setFormData] = useState({
        nama_pelanggaran: '',
        kategori: '',
        poin: ''
    })
    const [formErrors, setFormErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const kategoriOptions = [
        { value: 'ringan', label: 'Ringan' },
        { value: 'sedang', label: 'Sedang' },
        { value: 'berat', label: 'Berat' }
    ]

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('master_pelanggaran')
                .select('*')
                .order('kategori')
                .order('nama_pelanggaran')

            if (error) throw error
            setData(data || [])
        } catch (error) {
            console.error('Error fetching master pelanggaran:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setSelectedItem(null)
        setFormData({ nama_pelanggaran: '', kategori: '', poin: '' })
        setFormErrors({})
        setIsModalOpen(true)
    }

    const handleEdit = (item) => {
        setSelectedItem(item)
        setFormData({
            nama_pelanggaran: item.nama_pelanggaran,
            kategori: item.kategori,
            poin: item.poin.toString()
        })
        setFormErrors({})
        setIsModalOpen(true)
    }

    const handleDelete = (item) => {
        setSelectedItem(item)
        setIsDeleteModalOpen(true)
    }

    const validateForm = () => {
        const errors = {}
        if (!formData.nama_pelanggaran.trim()) errors.nama_pelanggaran = 'Nama pelanggaran wajib diisi'
        if (!formData.kategori) errors.kategori = 'Kategori wajib dipilih'
        if (!formData.poin || parseInt(formData.poin) <= 0) errors.poin = 'Poin wajib diisi dan lebih dari 0'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            if (selectedItem) {
                const { error } = await supabase
                    .from('master_pelanggaran')
                    .update({
                        nama_pelanggaran: formData.nama_pelanggaran,
                        kategori: formData.kategori,
                        poin: parseInt(formData.poin)
                    })
                    .eq('id', selectedItem.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('master_pelanggaran')
                    .insert({
                        nama_pelanggaran: formData.nama_pelanggaran,
                        kategori: formData.kategori,
                        poin: parseInt(formData.poin)
                    })

                if (error) throw error
            }

            setIsModalOpen(false)
            fetchData()
        } catch (error) {
            console.error('Error saving master pelanggaran:', error)
            setFormErrors({ submit: error.message })
        } finally {
            setSubmitting(false)
        }
    }

    const confirmDelete = async () => {
        try {
            const { error } = await supabase
                .from('master_pelanggaran')
                .delete()
                .eq('id', selectedItem.id)

            if (error) throw error
            setIsDeleteModalOpen(false)
            fetchData()
        } catch (error) {
            console.error('Error deleting master pelanggaran:', error)
        }
    }

    const filteredData = data.filter(item => {
        const matchSearch = item.nama_pelanggaran.toLowerCase().includes(searchTerm.toLowerCase())
        const matchKategori = !filterKategori || item.kategori === filterKategori
        return matchSearch && matchKategori
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
            header: 'Nama Pelanggaran',
            accessor: 'nama_pelanggaran'
        },
        {
            header: 'Kategori',
            width: '120px',
            render: (row) => getKategoriBadge(row.kategori)
        },
        {
            header: 'Poin',
            width: '80px',
            render: (row) => (
                <span className="font-semibold text-primary">{row.poin}</span>
            )
        },
        {
            header: 'Aksi',
            width: '120px',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Master Pelanggaran</h1>
                    <p className="text-text-secondary">Kelola jenis pelanggaran dan poin</p>
                </div>
                <Button onClick={handleAdd} icon={Plus}>
                    Tambah Pelanggaran
                </Button>
            </div>

            {/* Content */}
            <Card noPadding>
                {/* Filters */}
                <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            icon={Search}
                            placeholder="Cari pelanggaran..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select
                            value={filterKategori}
                            onChange={(e) => setFilterKategori(e.target.value)}
                            options={kategoriOptions}
                            placeholder="Semua Kategori"
                        />
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={filteredData}
                    loading={loading}
                    emptyMessage="Belum ada data master pelanggaran"
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem ? 'Edit Pelanggaran' : 'Tambah Pelanggaran'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama Pelanggaran"
                        value={formData.nama_pelanggaran}
                        onChange={(e) => setFormData({ ...formData, nama_pelanggaran: e.target.value })}
                        error={formErrors.nama_pelanggaran}
                        placeholder="Contoh: Tidak mengikuti sholat berjamaah"
                    />
                    <Select
                        label="Kategori"
                        value={formData.kategori}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        error={formErrors.kategori}
                        options={kategoriOptions}
                        placeholder="Pilih kategori"
                    />
                    <Input
                        label="Poin"
                        type="number"
                        min="1"
                        value={formData.poin}
                        onChange={(e) => setFormData({ ...formData, poin: e.target.value })}
                        error={formErrors.poin}
                        placeholder="Contoh: 10"
                    />

                    {formErrors.submit && (
                        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                            {formErrors.submit}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" loading={submitting}>
                            {selectedItem ? 'Simpan' : 'Tambah'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Konfirmasi Hapus"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-text-secondary">
                        Apakah Anda yakin ingin menghapus pelanggaran <strong className="text-text-primary">{selectedItem?.nama_pelanggaran}</strong>?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Hapus
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default MasterPelanggaran
