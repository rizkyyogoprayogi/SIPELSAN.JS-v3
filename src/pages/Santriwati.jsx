import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'

const Santriwati = () => {
    const [data, setData] = useState([])
    const [kelas, setKelas] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [formData, setFormData] = useState({
        nis: '',
        nama: '',
        kelas_id: ''
    })
    const [formErrors, setFormErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
        fetchKelas()
    }, [])

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('santriwati')
                .select(`
          *,
          kelas:kelas_id (nama_kelas)
        `)
                .order('nama')

            if (error) throw error
            setData(data || [])
        } catch (error) {
            console.error('Error fetching santriwati:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchKelas = async () => {
        const { data } = await supabase
            .from('kelas')
            .select('id, nama_kelas')
            .order('nama_kelas')

        setKelas(data || [])
    }

    const handleAdd = () => {
        setSelectedItem(null)
        setFormData({ nis: '', nama: '', kelas_id: '' })
        setFormErrors({})
        setIsModalOpen(true)
    }

    const handleEdit = (item) => {
        setSelectedItem(item)
        setFormData({
            nis: item.nis,
            nama: item.nama,
            kelas_id: item.kelas_id || ''
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
        if (!formData.nis.trim()) errors.nis = 'NIS wajib diisi'
        if (!formData.nama.trim()) errors.nama = 'Nama wajib diisi'
        if (!formData.kelas_id) errors.kelas_id = 'Kelas wajib dipilih'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            if (selectedItem) {
                // Update
                const { error } = await supabase
                    .from('santriwati')
                    .update({
                        nis: formData.nis,
                        nama: formData.nama,
                        kelas_id: parseInt(formData.kelas_id)
                    })
                    .eq('id', selectedItem.id)

                if (error) throw error
            } else {
                // Insert
                const { error } = await supabase
                    .from('santriwati')
                    .insert({
                        nis: formData.nis,
                        nama: formData.nama,
                        kelas_id: parseInt(formData.kelas_id),
                        total_poin: 0
                    })

                if (error) throw error
            }

            setIsModalOpen(false)
            fetchData()
        } catch (error) {
            console.error('Error saving santriwati:', error)
            setFormErrors({ submit: error.message })
        } finally {
            setSubmitting(false)
        }
    }

    const confirmDelete = async () => {
        try {
            const { error } = await supabase
                .from('santriwati')
                .delete()
                .eq('id', selectedItem.id)

            if (error) throw error
            setIsDeleteModalOpen(false)
            fetchData()
        } catch (error) {
            console.error('Error deleting santriwati:', error)
        }
    }

    const filteredData = data.filter(item =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nis.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const columns = [
        {
            header: 'NIS',
            accessor: 'nis',
            width: '120px'
        },
        {
            header: 'Nama',
            accessor: 'nama'
        },
        {
            header: 'Kelas',
            render: (row) => row.kelas?.nama_kelas || '-'
        },
        {
            header: 'Total Poin',
            render: (row) => (
                <span className={`font-semibold ${row.total_poin >= 100 ? 'text-danger' :
                    row.total_poin >= 50 ? 'text-warning' :
                        'text-success'
                    }`}>
                    {row.total_poin}
                </span>
            ),
            width: '100px'
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
                    <h1 className="text-2xl font-bold text-text-primary">Data Santriwati</h1>
                    <p className="text-text-secondary">Kelola data santriwati</p>
                </div>
                <Button onClick={handleAdd} icon={Plus}>
                    Tambah Santriwati
                </Button>
            </div>

            {/* Content */}
            <Card noPadding>
                {/* Search */}
                <div className="p-4 border-b border-border">
                    <Input
                        icon={Search}
                        placeholder="Cari berdasarkan nama atau NIS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={filteredData}
                    loading={loading}
                    emptyMessage="Belum ada data santriwati"
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem ? 'Edit Santriwati' : 'Tambah Santriwati'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="NIS"
                        value={formData.nis}
                        onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                        error={formErrors.nis}
                        placeholder="Masukkan NIS"
                    />
                    <Input
                        label="Nama Lengkap"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        error={formErrors.nama}
                        placeholder="Masukkan nama lengkap"
                    />
                    <Select
                        label="Kelas"
                        value={formData.kelas_id}
                        onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                        error={formErrors.kelas_id}
                        options={kelas.map(k => ({ value: k.id, label: k.nama_kelas }))}
                        placeholder="Pilih kelas"
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
                        Apakah Anda yakin ingin menghapus santriwati <strong className="text-text-primary">{selectedItem?.nama}</strong>?
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

export default Santriwati
