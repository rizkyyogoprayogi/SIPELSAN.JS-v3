import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { Upload, X, CheckCircle, Send } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

const InputPelanggaran = () => {
    const { user } = useAuth()
    const [santriwatiList, setSantriwatiList] = useState([])
    const [pelanggaranList, setPelanggaranList] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        santriwati_id: '',
        pelanggaran_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: ''
    })
    const [file, setFile] = useState(null)
    const [filePreview, setFilePreview] = useState(null)
    const [formErrors, setFormErrors] = useState({})

    // Selected data info
    const [selectedSantriwati, setSelectedSantriwati] = useState(null)
    const [selectedPelanggaran, setSelectedPelanggaran] = useState(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [santriwatiRes, pelanggaranRes] = await Promise.all([
                supabase
                    .from('santriwati')
                    .select('id, nis, nama, total_poin, kelas:kelas_id(nama_kelas)')
                    .order('nama'),
                supabase
                    .from('master_pelanggaran')
                    .select('*')
                    .order('kategori')
                    .order('nama_pelanggaran')
            ])

            setSantriwatiList(santriwatiRes.data || [])
            setPelanggaranList(pelanggaranRes.data || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSantriwatiChange = (e) => {
        const id = e.target.value
        setFormData({ ...formData, santriwati_id: id })
        const selected = santriwatiList.find(s => s.id === parseInt(id))
        setSelectedSantriwati(selected || null)
    }

    const handlePelanggaranChange = (e) => {
        const id = e.target.value
        setFormData({ ...formData, pelanggaran_id: id })
        const selected = pelanggaranList.find(p => p.id === parseInt(id))
        setSelectedPelanggaran(selected || null)
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            // Validate file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setFormErrors({ ...formErrors, file: 'Ukuran file maksimal 5MB' })
                return
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
            if (!allowedTypes.includes(selectedFile.type)) {
                setFormErrors({ ...formErrors, file: 'Format file harus JPEG, PNG, GIF, atau PDF' })
                return
            }

            setFile(selectedFile)
            setFormErrors({ ...formErrors, file: null })

            // Generate preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = () => setFilePreview(reader.result)
                reader.readAsDataURL(selectedFile)
            } else {
                setFilePreview(null)
            }
        }
    }

    const removeFile = () => {
        setFile(null)
        setFilePreview(null)
    }

    const validateForm = () => {
        const errors = {}
        if (!formData.santriwati_id) errors.santriwati_id = 'Santriwati wajib dipilih'
        if (!formData.pelanggaran_id) errors.pelanggaran_id = 'Jenis pelanggaran wajib dipilih'
        if (!formData.tanggal) errors.tanggal = 'Tanggal wajib diisi'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            let buktiUrl = null

            // Upload file if exists
            if (file) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}_${formData.santriwati_id}.${fileExt}`
                const filePath = `bukti/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('pelanggaran')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: urlData } = supabase.storage
                    .from('pelanggaran')
                    .getPublicUrl(filePath)

                buktiUrl = urlData.publicUrl
            }

            // Insert pelanggaran
            const { error: insertError } = await supabase
                .from('pelanggaran')
                .insert({
                    santriwati_id: parseInt(formData.santriwati_id),
                    pelanggaran_id: parseInt(formData.pelanggaran_id),
                    tanggal: formData.tanggal,
                    keterangan: formData.keterangan || null,
                    bukti_url: buktiUrl,
                    created_by: user.id
                })

            if (insertError) throw insertError

            // Update total poin santriwati
            const newTotalPoin = (selectedSantriwati?.total_poin || 0) + (selectedPelanggaran?.poin || 0)

            const { error: updateError } = await supabase
                .from('santriwati')
                .update({ total_poin: newTotalPoin })
                .eq('id', parseInt(formData.santriwati_id))

            if (updateError) throw updateError

            // Reset form
            setFormData({
                santriwati_id: '',
                pelanggaran_id: '',
                tanggal: new Date().toISOString().split('T')[0],
                keterangan: ''
            })
            setFile(null)
            setFilePreview(null)
            setSelectedSantriwati(null)
            setSelectedPelanggaran(null)
            setSuccess(true)

            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)

            // Refresh santriwati list
            fetchData()

        } catch (error) {
            console.error('Error submitting pelanggaran:', error)
            setFormErrors({ submit: error.message })
        } finally {
            setSubmitting(false)
        }
    }

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-text-secondary">Memuat data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Input Pelanggaran</h1>
                <p className="text-text-secondary">Catat pelanggaran santriwati</p>
            </div>

            {/* Success Alert */}
            {success && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30 flex items-center gap-3 animate-slide-up">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-success">Pelanggaran berhasil dicatat!</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-2">
                    <Card title="Form Pelanggaran">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Select
                                label="Santriwati"
                                value={formData.santriwati_id}
                                onChange={handleSantriwatiChange}
                                error={formErrors.santriwati_id}
                                options={santriwatiList.map(s => ({
                                    value: s.id,
                                    label: `${s.nis} - ${s.nama} (${s.kelas?.nama_kelas || '-'})`
                                }))}
                                placeholder="Pilih santriwati"
                            />

                            <Select
                                label="Jenis Pelanggaran"
                                value={formData.pelanggaran_id}
                                onChange={handlePelanggaranChange}
                                error={formErrors.pelanggaran_id}
                                options={pelanggaranList.map(p => ({
                                    value: p.id,
                                    label: `${p.nama_pelanggaran} (${p.poin} poin)`
                                }))}
                                placeholder="Pilih jenis pelanggaran"
                            />

                            <Input
                                label="Tanggal"
                                type="date"
                                value={formData.tanggal}
                                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                error={formErrors.tanggal}
                            />

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Keterangan (Opsional)
                                </label>
                                <textarea
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-text-primary placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 resize-none"
                                    placeholder="Tambahkan keterangan jika diperlukan..."
                                />
                            </div>

                            {/* File Upload */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Bukti (Opsional)
                                </label>

                                {!file ? (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="h-8 w-8 text-text-secondary mb-2" />
                                            <p className="text-sm text-text-secondary">
                                                <span className="text-primary font-medium">Klik untuk upload</span> atau drag & drop
                                            </p>
                                            <p className="text-xs text-text-secondary mt-1">
                                                PNG, JPG, GIF atau PDF (Maks. 5MB)
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".jpg,.jpeg,.png,.gif,.pdf"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                ) : (
                                    <div className="relative p-4 border border-border rounded-lg">
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>

                                        {filePreview ? (
                                            <img
                                                src={filePreview}
                                                alt="Preview"
                                                className="max-h-40 mx-auto rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 rounded-lg bg-primary/20">
                                                    <Upload className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white">{file.name}</p>
                                                    <p className="text-xs text-text-secondary">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {formErrors.file && (
                                    <p className="text-sm text-danger">{formErrors.file}</p>
                                )}
                            </div>

                            {formErrors.submit && (
                                <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                                    {formErrors.submit}
                                </div>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                loading={submitting}
                                icon={Send}
                            >
                                Simpan Pelanggaran
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    {/* Selected Santriwati Info */}
                    {selectedSantriwati && (
                        <Card title="Info Santriwati">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-text-secondary">Nama</p>
                                    <p className="font-medium text-white">{selectedSantriwati.nama}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary">NIS</p>
                                    <p className="text-white">{selectedSantriwati.nis}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary">Kelas</p>
                                    <p className="text-white">{selectedSantriwati.kelas?.nama_kelas || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary">Total Poin Saat Ini</p>
                                    <p className={`text-2xl font-bold ${selectedSantriwati.total_poin >= 100 ? 'text-danger' :
                                            selectedSantriwati.total_poin >= 50 ? 'text-warning' :
                                                'text-success'
                                        }`}>
                                        {selectedSantriwati.total_poin}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Selected Pelanggaran Info */}
                    {selectedPelanggaran && (
                        <Card title="Info Pelanggaran">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-text-secondary">Nama Pelanggaran</p>
                                    <p className="font-medium text-white">{selectedPelanggaran.nama_pelanggaran}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary">Kategori</p>
                                    {getKategoriBadge(selectedPelanggaran.kategori)}
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary">Poin</p>
                                    <p className="text-2xl font-bold text-primary">{selectedPelanggaran.poin}</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Preview Total */}
                    {selectedSantriwati && selectedPelanggaran && (
                        <Card className="border border-primary/50">
                            <div className="text-center">
                                <p className="text-sm text-text-secondary mb-2">Estimasi Total Poin</p>
                                <p className={`text-4xl font-bold ${(selectedSantriwati.total_poin + selectedPelanggaran.poin) >= 100 ? 'text-danger' :
                                        (selectedSantriwati.total_poin + selectedPelanggaran.poin) >= 50 ? 'text-warning' :
                                            'text-success'
                                    }`}>
                                    {selectedSantriwati.total_poin + selectedPelanggaran.poin}
                                </p>
                                <p className="text-xs text-text-secondary mt-2">
                                    {selectedSantriwati.total_poin} + {selectedPelanggaran.poin} poin
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

export default InputPelanggaran
