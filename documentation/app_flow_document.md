Berikut adalah User Story (Kisah Pengguna) yang terperinci untuk setiap fitur pada **Fase 1 (MVP)**, disesuaikan dengan peran pengguna dan filosofi UX Sederhana.

---

## 📝 User Stories Detail (Phase 1 / MVP)

### Modul 1: Pendaftaran & Registrasi (Role: Admin)

| **No.** | **User Story** | Perubahan/Penambahan |
| --- | --- | --- |
| **1.1** | **Sebagai Admin**, saya ingin **mencari data pasien yang sudah ada** menggunakan Nomor RM, NIK, atau Nama pada satu *search bar* yang cepat, agar saya tidak perlu membuat data ganda dan proses registrasi menjadi efisien. |  |
| **1.2** | **Sebagai Admin**, saya ingin **membuat data pasien baru** dengan mengisi formulir sederhana (2-step wizard) yang mencakup data demografi inti, agar pasien dapat segera memiliki Nomor RM unik. |  |
| **1.3** | **Sebagai Admin**, saya ingin **mengedit data pasien yang sudah ada**, agar informasi kontak dan alamat pasien selalu *up-to-date*. |  |
| **1.4** | **Sebagai Admin**, saya ingin **mendaftarkan pasien untuk kunjungan Rawat Jalan** dengan memilih Dokter/Poli yang dituju, agar pasien masuk ke antrian digital yang benar. |  |
| **1.5** | **Sebagai Admin**, saya ingin **mendaftarkan pasien untuk Rawat Inap** dengan memilih Kamar dan Jenis Jaminan/Pembayaran, agar status kamar terisi dan alur *billing* dimulai. |  |
| **1.6** | **Sebagai Admin**, saya ingin **mencetak kartu antrian sederhana** yang berisi Nama Pasien, Nomor Antrian, dan Poli, sebagai bukti registrasi. |  |
| 1.7 | **Sebagai Admin/Perawat Triage**, saya ingin **melakukan pendaftaran cepat (One-Click Registration)** untuk kasus Gawat Darurat/Kecelakaan, hanya dengan memasukkan nama dan keluhan utama, agar penanganan medis tidak tertunda. | **Baru/Kritis:** Fitur *Express Registration* harus ada di *Header* aplikasi (misalnya, tombol **[UGD Cepat]**). |
| 1.8 | **Sebagai Admin**, saya ingin **mengubah status kunjungan UGD** menjadi Rawat Jalan atau Rawat Inap, jika diperlukan, agar alur data pasien berpindah modul secara mulus. | Baru: Integrasi handover ke modul lain. |

### Modul 2: Rekam Medis Elektronik (RME) & Rawat Jalan (Role: Dokter, Perawat)

| **No.** | **User Story** |
| --- | --- |
| **2.1** | **Sebagai Dokter/Perawat**, saya ingin **melihat daftar pasien dalam antrian saya (poli)**, agar saya tahu siapa yang harus dipanggil selanjutnya dan status pasien (Sudah di-triage/Belum). |
| **2.2** | **Sebagai Dokter**, saya ingin **mengakses RME pasien dari antrian saya** dengan satu kali klik, agar saya bisa langsung memulai pemeriksaan. |
| **2.3** | **Sebagai Dokter**, saya ingin **mengisi data SOAP (Subjektif, Objektif, Analisis, Plan)** menggunakan *text area* yang jelas per bagian, agar dokumentasi terstruktur dan mudah dibaca. |
| **2.4** | **Sebagai Dokter**, saya ingin **mencari dan memilih Diagnosis Akhir (ICD-10)** menggunakan fitur *autocomplete* pada Tab Diagnosis, agar koding diagnosis akurat dan cepat. |
| **2.5** | **Sebagai Dokter**, saya ingin **melihat riwayat RME pasien sebelumnya** pada *sidebar* atau *pop-up* di layar RME saat ini, agar saya bisa membuat keputusan klinis berdasarkan riwayat. |
| **2.6** | **Sebagai Dokter**, saya ingin **mencatat Rencana Tindakan/Prosedur (ICD-9)** yang dilakukan saat itu, agar tindakan tersebut otomatis masuk ke *billing* pasien. |
| **2.7** | **Sebagai Dokter**, saya ingin **membuat resep digital** pada Tab Resep, mencakup Nama Obat, Dosis, Frekuensi, dan Kuantitas, agar resep otomatis terkirim ke Apotek. |
| **2.8** | **Sebagai Dokter**, saya ingin **menyimpan RME sebagai 'Draf'**, agar saya bisa keluar dari layar tanpa kehilangan data dan melanjutkannya nanti. |
| **2.9** | **Sebagai Dokter**, saya ingin **mengunci dan menyelesaikan RME**, agar data pasien menjadi permanen dan proses *billing* dapat dilanjutkan oleh Kasir. |

### Modul 3: Rawat Inap (Role: Perawat)

| **No.** | **User Story** |
| --- | --- |
| **3.1** | **Sebagai Perawat**, saya ingin **melihat status hunian kamar/bed** dalam tampilan *visual dashboard* yang jelas (misalnya Hijau: Kosong, Kuning: Terisi), agar manajemen kamar mudah. |
| **3.2** | **Sebagai Perawat**, saya ingin **mencatat Tanda-Tanda Vital (Suhu, Tekanan Darah, Nadi, Respirasi)** pasien Rawat Inap secara berkala, agar perkembangan kondisi pasien dapat dipantau. |
| **3.3** | **Sebagai Perawat**, saya ingin **menambahkan Catatan Perkembangan Pasien Terintegrasi (CPPT)** harian, agar komunikasi antar-staf medis (dokter/perawat) terjamin. |
| **3.4** | **Sebagai Perawat**, saya ingin **mencatat pemakaian alat atau material medis** saat melakukan tindakan kepada pasien Rawat Inap, agar biaya material tersebut masuk ke *billing*. |

### Modul 4: Apotek/Farmasi (Role: Apoteker)

| **No.** | **User Story** |
| --- | --- |
| **4.1** | **Sebagai Apoteker**, saya ingin **menerima notifikasi *real-time* (Pop-up/Widget)** saat Dokter menerbitkan resep digital baru, agar saya bisa segera menyiapkan obat. |
| **4.2** | **Sebagai Apoteker**, saya ingin **melihat daftar resep yang harus dilayani**, menampilkan nama pasien dan nama Dokter yang meresepkan, agar proses antrian resep terorganisir. |
| **4.3** | **Sebagai Apoteker**, saya ingin **mengelola stok obat** dengan mencatat pemasukan baru (termasuk *batch number* dan tanggal kadaluarsa), agar inventaris akurat. |
| **4.4** | **Sebagai Apoteker**, saya ingin **memproses resep digital** dan secara otomatis **mengurangi kuantitas stok** obat yang dikeluarkan, agar stok sistem selalu *update*. |
| **4.5** | **Sebagai Apoteker**, saya ingin **melihat peringatan (highlight Merah/Kuning)** pada obat yang Stoknya di bawah batas minimum atau yang akan Kadaluarsa dalam 30 hari, agar saya bisa mengambil tindakan cepat. |

### Modul 5: Kasir & Billing (Role: Admin/Kasir)

| **No.** | **User Story** |
| --- | --- |
| **5.1** | **Sebagai Kasir**, saya ingin **mencari kunjungan pasien yang sudah selesai (RME/Pulang dikunci)**, agar saya bisa memulai proses perhitungan tagihan. |
| **5.2** | **Sebagai Kasir**, saya ingin sistem **menarik dan mengagregasi semua biaya secara otomatis** (Administrasi, Layanan Dokter, Tindakan, Obat), agar perhitungan total biaya bebas dari kesalahan manual. |
| **5.3** | **Sebagai Kasir**, saya ingin **mencatat diskon atau potongan asuransi/jaminan**, agar jumlah tagihan akhir yang harus dibayar pasien terhitung benar. |
| **5.4** | **Sebagai Kasir**, saya ingin **memilih metode pembayaran (Tunai/Transfer)** dan jika tunai, **menginput jumlah uang yang diterima**, agar sistem menampilkan kembalian secara otomatis. |
| **5.5** | **Sebagai Kasir**, saya ingin **menyelesaikan transaksi** dan mengubah status *billing* menjadi "Lunas", agar pasien dapat dipulangkan. |
| **5.6** | **Sebagai Kasir**, saya ingin **mencetak kuitansi pembayaran** dengan rincian biaya, sebagai bukti transaksi yang sah. |

### Modul 6: Pasien Pulang (Role: Dokter, Admin)

| **No.** | **User Story** |
| --- | --- |
| **6.1** | **Sebagai Dokter**, saya ingin **mengisi ringkasan medis pasien Rawat Inap** sebelum dipulangkan, agar pasien memiliki dokumen ringkasan perawatan. |
| **6.2** | **Sebagai Dokter**, saya ingin **menentukan tanggal kontrol pasien berikutnya** dan mencatat instruksi kepulangan, agar kesinambungan perawatan terjaga. |
| **6.3** | **Sebagai Admin**, saya ingin sistem **memblokir status 'Pasien Pulang'** jika status *billing* belum LUNAS, agar tidak ada pasien yang pulang tanpa menyelesaikan kewajiban pembayaran. |
| **6.4** | **Sebagai Admin**, saya ingin **mengubah status kunjungan pasien menjadi 'Selesai/Pulang'** setelah semua proses (RME dan Billing) selesai, agar data kunjungan tercatat sebagai riwayat. |

### Modul 7: Unit Gawat Darurat (UGD) (Role: Dokter UGD, Perawat Triage)

| **No.** | **User Story** |
| --- | --- |
| **7.1** | **Sebagai Perawat Triage**, saya ingin **mencatat status Triage** (misalnya, Merah, Kuning, Hijau) pada saat kedatangan, agar Dokter UGD dapat memprioritaskan pasien. |
| **7.2** | **Sebagai Dokter UGD**, saya ingin **melihat *dashboard* antrian UGD** yang menampilkan Triage, Waktu Kedatangan, dan Nama Pasien, agar saya bisa melihat prioritas penanganan. |
| **7.3** | **Sebagai Dokter UGD**, saya ingin **mengakses RME khusus UGD** yang fokus pada kondisi klinis saat ini (Riwayat Singkat, Pemeriksaan Fisik Terarah, dan Tindakan Cepat), agar dokumentasi penanganan gawat darurat efisien. |
| **7.4** | **Sebagai Dokter UGD**, saya ingin **mencatat tindakan medis segera** yang diberikan di UGD (misalnya, jahitan, pemasangan infus) secara cepat, agar semua tindakan terdata untuk *billing*. |
| **7.5** | **Sebagai Dokter UGD**, saya ingin **menentukan *Disposition* (Keputusan Akhir)** dari UGD, yaitu: **Pulang**, **Rawat Jalan Lanjut**, atau **Rawat Inap**, agar proses *handover* ke modul berikutnya jelas. |
| **7.6** | **Sebagai Perawat Triage**, saya ingin **mengubah data pasien (yang didaftarkan cepat)** menjadi data lengkap (NIK, Alamat, Jaminan) setelah kondisi pasien stabil, agar data lengkap tersedia untuk *billing* dan RME permanen. |