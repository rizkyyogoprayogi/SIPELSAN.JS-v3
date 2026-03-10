import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'

const Kelas = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [formData, setFormData] = useState({
        nama_kelas: '',
        lembaga: 'SMP',
        wali_kelas: '',
        nomor_hp: ''
    })
    const [formErrors, setFormErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('kelas')
                .select('*')
                .order('nama_kelas')

            if (error) throw error
            setData(data || [])
        } catch (error) {
            console.error('Error fetching kelas:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setSelectedItem(null)
        setFormData({ nama_kelas: '', lembaga: 'SMP', wali_kelas: '', nomor_hp: '' })
        setFormErrors({})
        setIsModalOpen(true)
    }

    const handleEdit = (item) => {
        setSelectedItem(item)
        setFormData({
            nama_kelas: item.nama_kelas,
            lembaga: item.lembaga || 'SMP',
            wali_kelas: item.wali_kelas || '',
            nomor_hp: item.nomor_hp || ''
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
        if (!formData.nama_kelas.trim()) errors.nama_kelas = 'Nama kelas wajib diisi'
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
                    .from('kelas')
                    .update({
                        nama_kelas: formData.nama_kelas,
                        lembaga: formData.lembaga,
                        wali_kelas: formData.wali_kelas,
                        nomor_hp: formData.nomor_hp
                    })
                    .eq('id', selectedItem.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('kelas')
                    .insert({
                        nama_kelas: formData.nama_kelas,
                        lembaga: formData.lembaga,
                        wali_kelas: formData.wali_kelas,
                        nomor_hp: formData.nomor_hp
                    })

                if (error) throw error
            }

            setIsModalOpen(false)
            fetchData()
        } catch (error) {
            console.error('Error saving kelas:', error)
            setFormErrors({ submit: error.message })
        } finally {
            setSubmitting(false)
        }
    }

    const confirmDelete = async () => {
        try {
            const { error } = await supabase
                .from('kelas')
                .delete()
                .eq('id', selectedItem.id)

            if (error) throw error
            setIsDeleteModalOpen(false)
            fetchData()
        } catch (error) {
            console.error('Error deleting kelas:', error)
        }
    }

    const columns = [
        {
            header: 'No',
            width: '60px',
            render: (row, index) => data.indexOf(row) + 1
        },
        {
            header: 'Nama Kelas',
            render: (row) => (
                <Link to={`/kelas/${row.id}`} className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors">
                    {row.nama_kelas}
                </Link>
            )
        },
        {
            header: 'Lembaga',
            width: '100px',
            render: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.lembaga === 'SMA' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                    {row.lembaga || '-'}
                </span>
            )
        },
        {
            header: 'Wali Kelas',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{row.wali_kelas || '-'}</span>
                    {row.nomor_hp && <span className="text-xs text-gray-500">{row.nomor_hp}</span>}
                </div>
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
                    <h1 className="text-2xl font-bold text-text-primary">Data Kelas</h1>
                    <p className="text-text-secondary">Kelola data kelas</p>
                </div>
                <Button onClick={handleAdd} icon={Plus}>
                    Tambah Kelas
                </Button>
            </div>

            {/* Content */}
            <Card noPadding>
                <Table
                    columns={columns}
                    data={data}
                    loading={loading}
                    emptyMessage="Belum ada data kelas"
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem ? 'Edit Kelas' : 'Tambah Kelas'}
                size="sm"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-text-primary">Lembaga</label>
                        <select
                            value={formData.lembaga}
                            onChange={(e) => setFormData({ ...formData, lembaga: e.target.value })}
                            className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        >
                            <option value="SMP">SMP</option>
                            <option value="SMA">SMA</option>
                        </select>
                    </div>

                    <Input
                        label="Nama Kelas"
                        value={formData.nama_kelas}
                        onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                        error={formErrors.nama_kelas}
                        placeholder="Contoh: VII A"
                    />

                    <Input
                        label="Wali Kelas"
                        value={formData.wali_kelas}
                        onChange={(e) => setFormData({ ...formData, wali_kelas: e.target.value })}
                        placeholder="Nama Wali Kelas"
                    />

                    <Input
                        label="Nomor HP"
                        type="tel"
                        value={formData.nomor_hp}
                        onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                        placeholder="Contoh: 08123456789"
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
                        Apakah Anda yakin ingin menghapus kelas <strong className="text-text-primary">{selectedItem?.nama_kelas}</strong>?
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

export default Kelas
