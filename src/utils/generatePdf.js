import jsPDF from 'jspdf'

export const generateSuratPeringatan = ({ santriwati, jenisSurat, totalPoin, pelanggaran, tanggal }) => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('PONDOK PESANTREN', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text('SURAT PERINGATAN', 105, 30, { align: 'center' })

    // Garis pembatas
    doc.setLineWidth(0.5)
    doc.line(20, 35, 190, 35)

    // Nomor surat
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const nomorSurat = `${jenisSurat}/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`
    doc.text(`Nomor: ${nomorSurat}`, 20, 45)
    doc.text(`Tanggal: ${tanggal}`, 20, 52)

    // Isi surat
    doc.setFontSize(11)
    doc.text('Kepada Yth,', 20, 65)
    doc.text('Orang Tua/Wali Santriwati', 20, 72)
    doc.text(`An. ${santriwati.nama}`, 20, 79)
    doc.text('Di Tempat', 20, 86)

    doc.text('Assalamu\'alaikum Wr. Wb.', 20, 100)

    const isiSurat = `Dengan hormat, melalui surat ini kami sampaikan bahwa putri Bapak/Ibu yang bernama ${santriwati.nama} dengan NIS ${santriwati.nis} telah melakukan beberapa pelanggaran tata tertib pondok pesantren.`

    doc.setFontSize(10)
    const splitIsi = doc.splitTextToSize(isiSurat, 170)
    doc.text(splitIsi, 20, 110)

    // Detail pelanggaran
    let yPos = 130
    doc.setFont('helvetica', 'bold')
    doc.text('Rincian Pelanggaran:', 20, yPos)
    doc.setFont('helvetica', 'normal')

    if (pelanggaran && pelanggaran.length > 0) {
        pelanggaran.forEach((p, index) => {
            yPos += 7
            doc.text(`${index + 1}. ${p.nama_pelanggaran} (${p.poin} poin)`, 25, yPos)
        })
    }

    yPos += 15
    doc.setFont('helvetica', 'bold')
    doc.text(`Total Akumulasi Poin: ${totalPoin} poin`, 20, yPos)

    yPos += 15
    doc.setFont('helvetica', 'normal')

    let sanksiText = ''
    if (jenisSurat === 'SP1') {
        sanksiText = 'Dengan surat peringatan pertama ini, kami harap orang tua/wali dapat memberikan pembinaan lebih intensif kepada putrinya.'
    } else if (jenisSurat === 'SP2') {
        sanksiText = 'Dengan surat peringatan kedua ini, apabila masih terjadi pelanggaran, maka akan diberikan sanksi yang lebih berat.'
    } else {
        sanksiText = 'Dengan surat peringatan ketiga ini, apabila masih terjadi pelanggaran, maka santriwati akan dikembalikan kepada orang tua/wali.'
    }

    const splitSanksi = doc.splitTextToSize(sanksiText, 170)
    doc.text(splitSanksi, 20, yPos)

    yPos += 25
    doc.text('Demikian surat peringatan ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.', 20, yPos)

    yPos += 15
    doc.text('Wassalamu\'alaikum Wr. Wb.', 20, yPos)

    // Tanda tangan
    yPos += 20
    doc.text('Hormat kami,', 140, yPos)
    yPos += 25
    doc.text('_____________________', 130, yPos)
    yPos += 7
    doc.text('Kepala Pondok Pesantren', 133, yPos)

    return doc
}

export const downloadPdf = (doc, filename) => {
    doc.save(filename)
}

export const getPdfBlob = (doc) => {
    return doc.output('blob')
}
