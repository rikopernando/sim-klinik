
## 📄 Product Requirements Document (PRD) - Sistem Informasi Klinik Desa (SIK-Desa)

### 1. Ringkasan Eksekutif

* **Nama Produk:** Sistem Informasi Klinik Desa (SIK-Desa)
* **Tujuan Utama:** Mendigitalisasi alur kerja inti klinik (Pendaftaran, Triage UGD, RME, Kasir, Apotek) untuk meningkatkan kecepatan layanan (terutama di UGD), akurasi data, dan efisiensi operasional.
* **Filosofi Desain Kunci:** **Simple UX** ("Satu Tugas, Satu Layar") dan **Mobile-Friendly** (PWA) untuk memastikan adopsi tinggi oleh staf di lingkungan pedesaan.
* **Pengguna Target (MVP):** Admin Pendaftaran, Dokter, Perawat Triage, Apoteker, dan Kasir.

---

### 2. Sasaran (Goals) dan Metrik Kunci (KPI)

| Sasaran (SMART) | Metrik Kunci (KPI) |
| :--- | :--- |
| **Kecepatan Layanan Gawat Darurat** | Waktu rata-rata pendaftaran kasus UGD (menggunakan *Quick Register*) **di bawah 30 detik**. |
| **Akurasi & Kepatuhan Data** | Persentase kelengkapan isian RME (SOAP/CPPT) mencapai **95%**. |
| **Efisiensi Inventaris Apotek** | Akurasi stok obat (Stok fisik vs. Stok sistem) mencapai **98%**. |
| **Adopsi Pengguna** | Persentase penggunaan RME digital oleh Dokter **100%** dalam bulan pertama operasional. |

---

### 3. Fitur dan Lingkup (Scope)

**Lingkup MVP (Fase 1):** Mencakup alur pasien dari kedatangan (termasuk UGD), pemeriksaan, hingga kepulangan/pembayaran.

#### A. Modul Pendaftaran & Registrasi

* **Kebutuhan Fungsional:**
    * **Pencarian Cepat:** Mampu mencari pasien menggunakan RM, NIK, atau Nama.
    * **Pendaftaran Baru:** Form **2-Step Wizard** untuk mencatat data demografi lengkap pasien.
    * **Registrasi Kunjungan:** Mencatat kunjungan (RJ/RI/UGD), memilih Poli/Dokter, dan Jenis Pembayaran (Umum/Asuransi).
    * **Antrian Digital:** Tampilan *dashboard* antrian *real-time* per Poli.

#### B. Modul Unit Gawat Darurat (UGD) - **Fitur Kritis**

* **Kebutuhan Fungsional:**
    * **Pendaftaran Cepat (One-Click Registration):** Pendaftaran UGD minimalis hanya dengan Nama dan Keluhan, untuk penanganan segera.
    * **Triage Prioritas:** Mampu mencatat status Triage (Merah/Kuning/Hijau) yang terlihat jelas di antrian UGD.
    * **Dashboard UGD:** Tampilan antrian UGD yang memprioritaskan kasus Merah/Kuning (sesuai Triage).
    * **Disposisi:** Fitur penentuan akhir dari UGD: Pulang, Rawat Jalan Lanjut, atau Rawat Inap.

#### C. Modul Rekam Medis Elektronik (RME) & Rawat Jalan

* **Kebutuhan Fungsional:**
    * **Alur RME Tabular:** Pengisian RME menggunakan **Tabbed Interface** (SOAP/CPPT, Diagnosis, Resep, Tindakan) untuk meminimalkan *scrolling*.
    * **Diagnosis Cepat:** Fitur *autocomplete search* untuk kode **ICD-10** (Diagnosis) dan **ICD-9** (Tindakan/Prosedur).
    * **Resep Digital:** Membuat resep dengan detail dosis/frekuensi dan diteruskan otomatis ke Modul Apotek.
    * **Riwayat Medis:** Akses cepat ke riwayat RME pasien di layar pemeriksaan.
    * **Penguncian Data:** RME harus **dikunci** oleh Dokter setelah pemeriksaan selesai untuk integritas data.

#### D. Modul Rawat Inap

* **Kebutuhan Fungsional:**
    * **Manajemen Kamar:** Dashboard visualisasi status hunian kamar/tempat tidur.
    * **Pencatatan Vital Sign & CPPT:** Formulir untuk Perawat mencatat Tanda-Tanda Vital dan Catatan Perkembangan Harian.
    * **Pencatatan Material:** Mencatat pemakaian material/alat medis untuk keperluan *billing*.

#### E. Modul Apotek/Farmasi

* **Kebutuhan Fungsional:**
    * **Inventaris:** Fitur input stok masuk (termasuk Batch No. dan Exp. Date) dan stok keluar.
    * **Notifikasi Resep:** Menerima notifikasi *real-time* untuk Resep Digital baru dari Dokter.
    * **Fulfillment Otomatis:** Otomatis mengurangi stok saat Resep diproses dan ditandai *fulfilled*.
    * **Peringatan Kadaluarsa/Stok:** Memberikan peringatan dini (e.g., 30 hari) untuk obat yang mendekati kadaluarsa atau stok minimum.

#### F. Modul Kasir & Billing

* **Kebutuhan Fungsional:**
    * **Agregasi Biaya Otomatis:** Sistem secara otomatis menarik semua biaya (Registrasi, Tindakan, Obat, Kamar) ke dalam *billing*.
    * **Pembayaran Sederhana:** Pencatatan metode pembayaran (Tunai/Transfer). Jika Tunai, sistem harus menghitung kembalian otomatis.
    * **Validasi Keuangan:** Mampu mencatat diskon atau jaminan/asuransi dan menghitung tagihan akhir.
    * **Cetak Kuitansi:** Mampu mencetak kuitansi pembayaran yang ringkas dan jelas.

#### G. Modul Pasien Pulang

* **Kebutuhan Fungsional:**
    * **Billing Gate:** Sistem harus **memblokir** status 'Pulang' (dari Rawat Inap/UGD) jika *billing* belum lunas/selesai.
    * **Surat Pulang:** Formulir ringkasan medis akhir (Diagnosis Akhir & Tindakan) dan instruksi tindak lanjut.
    * **Jadwal Kontrol:** Fitur untuk menetapkan tanggal kontrol pasien berikutnya.

---

### 4. Kebutuhan Pengguna (Role-Based Access Control - RBAC)

Aplikasi harus menerapkan otorisasi ketat berdasarkan peran:

| Peran Pengguna | Akses Utama yang Diizinkan | Akses yang Dibatasi |
| :--- | :--- | :--- |
| **Admin** | Pengaturan Sistem, Master Data (Tarif/Obat), Akses ke semua Laporan. | Mengisi RME (kecuali Admin adalah Dokter), Memproses Resep. |
| **Dokter** | RME (SOAP/CPPT/Diagnosis/Resep), Riwayat Pasien. | Manajemen Stok Obat, Pembayaran/Kasir, Pengaturan User Admin. |
| **Perawat** | Triage UGD, Pencatatan Vital Sign (Rawat Inap), CPPT, Manajemen Kamar. | Diagnosis, Penguncian RME, Penentuan Harga. |
| **Apoteker** | Inventaris Obat (Stok Masuk/Keluar), Pemenuhan Resep (Fulfillment). | Akses RME penuh, Finalisasi Billing Pasien. |
| **Kasir** | Modul Billing, Pencetakan Kuitansi, Validasi Pembayaran. | RME, Inventaris Obat. |

---

### 5. Kebutuhan Non-Fungsional

| Kategori | Persyaratan | Dampak ke Proyek |
| :--- | :--- | :--- |
| **Performa** | Waktu *loading* halaman dan pencarian pasien **maksimal 2 detik**. | Menggunakan Next.js (SSR/SSG) dan *caching* (React Query). |
| **Keamanan** | **Enkripsi SSL/TLS (HTTPS) WAJIB.** Data sensitif (PHI) harus dienkripsi saat disimpan (*at rest*). | Penggunaan NextAuth.js (JWT) dan AWS RDS Encryption. |
| **Ketersediaan** | Aplikasi harus memiliki *uptime* target **99.5%**. | Hosting di AWS dan menggunakan *managed service* (RDS, ECS/Vercel). |
| **Aksesibilitas (UX)** | Desain harus **Mobile Responsive (PWA)** dan menggunakan ukuran *font* dan *touch target* yang besar. | Penggunaan Tailwind CSS dan Headless UI. |
| **Regulasi** | Data RME harus memiliki **Audit Trail** (Siapa, Kapan, Apa yang diubah) untuk kepatuhan hukum. | Diimplementasikan di lapisan Backend (Prisma Middleware/DB Logging). |