## 📋 Task List Detail Aplikasi Klinik (Phase 1 / MVP)

### A. Core Setup & Infrastruktur

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **A.1** | Backend/DB | Inisialisasi Project Next.js, konfigurasi TypeScript & Environment Variables. | Tinggi | Fullstack | ✅ |
| **A.2** | Backend/DB | Setup **Prisma ORM**, koneksi ke PostgreSQL, dan buat migrasi awal (Tabel Users & Roles). | Tinggi | Backend | ✅ |
| **A.3** | Frontend/Styling | Konfigurasi **Tailwind CSS**, buat *custom theme* & *base components* (Primary Button, Input Field, Card) sesuai filosofi UX Sederhana. | Tinggi | Frontend | ✅ |
| **A.4** | Auth | Implementasi **NextAuth.js**: Setup provider Credential dan manajemen sesi berbasis JWT. | Tinggi | Backend | ✅ |
| **A.5** | Auth | Buat halaman Login/Logout. Implementasi **RBAC Middleware** (Role-Based Access Control) untuk otorisasi API Routes. | Tinggi | Fullstack | ✅ |
| **A.6** | Frontend | Buat Layout Aplikasi (Header, Sidebar Navigasi Responsif dan Persisten). | Tinggi | Frontend | ✅ |

### B. Modul Pendaftaran & Registrasi

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **B.1** | DB | Buat skema DB `Patients` dan `Visits`. Terapkan logika **Nomor RM (mr_number) auto-generation**. | Tinggi | Backend | ✅ |
| **B.2** | Backend | Buat API untuk *searching* pasien (filter by NIK, RM, Nama) dengan performa cepat. | Tinggi | Backend | ✅ |
| **B.3** | Frontend | Buat halaman Pendaftaran Pasien baru (**2-Step Wizard** sesuai panduan UX) dengan validasi input (React Hook Form/Zod). | Tinggi | Frontend | ✅ |
| **B.4** | Fullstack | Buat halaman Registrasi Kunjungan. Simpan data ke tabel `Visits` (Rawat Jalan/Rawat Inap/UGD). | Tinggi | Fullstack | ✅ |
| **B.5** | Frontend | Buat tampilan Antrian Pasien per Poli (Tampilan tabel/card yang dapat *refresh* otomatis). | Tinggi | Frontend | ✅ |
| **B.6** | Fullstack | Implementasi fungsi *update* dan *edit* data Pasien/Kunjungan. | Sedang | Fullstack | ⏳ |

### C. Modul Unit Gawat Darurat (UGD)

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **C.1** | DB | Tambahkan field `triage_status` (Merah, Kuning, Hijau) ke tabel `Visits`. | Tinggi | Backend | ✅ |
| **C.2** | Fullstack | Buat API dan Form **Registrasi Cepat UGD** (Hanya Nama & Keluhan). | Tinggi | Fullstack | ✅ |
| **C.3** | Frontend | Buat **Dashboard Antrian UGD** yang menampilkan *real-time status* dengan warna *highlight* berdasarkan Triage. | Tinggi | Frontend | ✅ |
| **C.4** | Fullstack | Buat form RME khusus UGD (Lebih ringkas, fokus Tindakan Cepat & Disposisi). | Tinggi | Fullstack | ✅ |
| **C.5** | Fullstack | Implementasi *handover* data: API untuk mengubah `visit_type` UGD menjadi Rawat Jalan/Rawat Inap. | Sedang | Fullstack | ✅ |

### D. Modul Rekam Medis Elektronik (RME) & Rawat Jalan

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **D.1** | DB | Buat skema DB `Medical_Records` (SOAP fields, is_locked, doctor_id). | Tinggi | Backend | ✅ |
| **D.2** | Backend | Buat API untuk CRUD RME, termasuk logika **penguncian data** (`is_locked`). | Tinggi | Backend | ✅ |
| **D.3** | Frontend | Buat halaman RME dengan **Tabbed Interface** (SOAP, Diagnosis, Resep, Tindakan) sesuai desain UX. | Tinggi | Frontend | ✅ |
| **D.4** | Fullstack | Implementasi *Search* ICD-10/ICD-9/Tindakan dengan *autocomplete* dan *lookup* di Tab Diagnosis. | Sedang | Fullstack | ✅ |
| **D.5** | Fullstack | Implementasi Resep Digital: Form input Dosis/Frekuensi, simpan ke tabel `Prescriptions`, dan *link* ke Apotek. | Tinggi | Fullstack | ✅ |
| **D.6** | Frontend | Tampilan Riwayat RME pasien sebelumnya dalam *pop-up* di layar RME utama. | Sedang | Frontend | ⏳ |

### E. Modul Rawat Inap

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **E.1** | DB | Buat skema DB `Rooms` dan `Vitals_History`. | Tinggi | Backend | ✅ |
| **E.2** | Frontend | Buat **Dashboard Kamar** (Visualisasi status hunian kamar: Kosong/Terisi). | Tinggi | Frontend | ✅ |
| **E.3** | Fullstack | Buat API dan Form untuk mencatat Tanda-Tanda Vital (Vital Sign) harian. | Tinggi | Fullstack | ✅ |
| **E.4** | Fullstack | Implementasi formulir Catatan Perkembangan Pasien Terintegrasi (**CPPT**). | Sedang | Fullstack | ✅ |
| **E.5** | Fullstack | API untuk mencatat pemakaian material/alat medis (agar masuk ke *billing*). | Sedang | Fullstack | ✅ |

### F. Modul Apotek / Farmasi

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **F.1** | DB | Buat skema DB `Drugs` (Master) dan `Drug_Inventory` (Stok, Batch, Exp. Date). | Tinggi | Backend | ⏳ |
| **F.2** | Backend | Buat API untuk CRUD data master obat dan manajemen stok masuk/keluar. | Tinggi | Backend | ⏳ |
| **F.3** | Backend | Buat *endpoint* untuk **Notifikasi Kadaluarsa** (menarik data obat yang Exp. Date < 30 hari). | Sedang | Backend | ⏳ |
| **F.4** | Frontend | Buat tampilan Daftar Resep Digital (Antrian Apotek) dengan *real-time notification* (widget/pop-up). | Tinggi | Frontend | ⏳ |
| **F.5** | Fullstack | Implementasi *Fulfillment* Resep: Logic mengurangi stok di `Drug_Inventory` dan menandai resep sebagai sudah diambil (`is_fulfilled`). | Tinggi | Fullstack | ⏳ |

### G. Modul Kasir & Billing & Pasien Pulang

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **G.1** | DB | Buat skema DB `Services` (Master Tarif) dan `Billings`. | Tinggi | Backend | ⏳ |
| **G.2** | Backend | Buat API **Billing Engine**: Logic menarik dan menjumlahkan semua komponen biaya (Tindakan, Obat, Kamar, Tarif). | Tinggi | Backend | ⏳ |
| **G.3** | Frontend | Buat Halaman Kasir dengan tampilan **Kotak Total (Sticky)** yang menonjol dan jelas. | Tinggi | Frontend | ⏳ |
| **G.4** | Fullstack | Implementasi Pencatatan Pembayaran dan **perhitungan kembalian otomatis**. | Tinggi | Fullstack | ⏳ |
| **G.5** | Backend | Implementasi **Billing Gate Logic**: Cek status `Billings.payment_status` sebelum mengizinkan proses Pulang. | Tinggi | Backend | ⏳ |
| **G.6** | Fullstack | Buat form Ringkasan Medis Pulang dan input Tanggal Kontrol Lanjutan. | Sedang | Fullstack | ⏳ |
| **G.7** | Backend | Buat API untuk mencetak kuitansi pembayaran/ringkasan pulang (Generate PDF atau Print View). | Sedang | Backend | ⏳ |

Daftar tugas ini sekarang mencakup semua yang dibutuhkan, dari *setup* dasar hingga fitur-fitur krusial. Anda dapat menggunakan tabel ini untuk alokasi kerja dan pemantauan kemajuan proyek.