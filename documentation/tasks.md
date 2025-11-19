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
| **F.1** | DB | Buat skema DB `Drugs` (Master) dan `Drug_Inventory` (Stok, Batch, Exp. Date). | Tinggi | Backend | ✅ |
| **F.2** | Backend | Buat API untuk CRUD data master obat dan manajemen stok masuk/keluar. | Tinggi | Backend | ✅ |
| **F.3** | Backend | Buat *endpoint* untuk **Notifikasi Kadaluarsa** (menarik data obat yang Exp. Date < 30 hari). | Sedang | Backend | ✅ |
| **F.4** | Frontend | Buat tampilan Daftar Resep Digital (Antrian Apotek) dengan *real-time notification* (widget/pop-up). | Tinggi | Frontend | ✅ |
| **F.5** | Fullstack | Implementasi *Fulfillment* Resep: Logic mengurangi stok di `Drug_Inventory` dan menandai resep sebagai sudah diambil (`is_fulfilled`). | Tinggi | Fullstack | ✅ |

### G. Modul Kasir & Billing & Pasien Pulang

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **G.1** | DB | Buat skema DB `Services` (Master Tarif) dan `Billings`. | Tinggi | Backend | ✅ |
| **G.2** | Backend | Buat API **Billing Engine**: Logic menarik dan menjumlahkan semua komponen biaya (Tindakan, Obat, Kamar, Tarif). | Tinggi | Backend | ✅ |
| **G.3** | Frontend | Buat Halaman Kasir dengan tampilan **Kotak Total (Sticky)** yang menonjol dan jelas. | Tinggi | Frontend | ✅ |
| **G.4** | Fullstack | Implementasi Pencatatan Pembayaran dan **perhitungan kembalian otomatis**. | Tinggi | Fullstack | ✅ |
| **G.5** | Backend | Implementasi **Billing Gate Logic**: Cek status `Billings.payment_status` sebelum mengizinkan proses Pulang. | Tinggi | Backend | ✅ |
| **G.6** | Fullstack | Buat form Ringkasan Medis Pulang dan input Tanggal Kontrol Lanjutan. | Sedang | Fullstack | ✅ |
| **G.7** | Backend | Buat API untuk mencetak kuitansi pembayaran/ringkasan pulang (Generate PDF atau Print View). | Sedang | Backend | ✅ |

### H. Integration & Cross-Module Workflows

#### H.1. Data Flow Integration (Module-to-Module Communication)

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **H.1.1** | RME → Apotek | Buat real-time notification system saat dokter membuat resep digital baru (WebSocket/Server-Sent Events). | Tinggi | Fullstack | ⏳ |
| **H.1.2** | RME → Kasir | Auto-update visit status menjadi "Ready for Billing" saat RME dikunci oleh dokter. | Tinggi | Backend | ⏳ |
| **H.1.3** | UGD → RJ/RI | Implementasi handover workflow dengan button "Transfer ke RI/RJ" di dashboard UGD. | Tinggi | Fullstack | ⏳ |
| **H.1.4** | Apotek → Billing | Auto-agregasi biaya obat yang sudah fulfilled ke billing items pasien (sudah ada di billing engine). | Tinggi | Backend | ✅ |
| **H.1.5** | Rawat Inap → Billing | Auto-agregasi biaya kamar (daily rate × days stayed) saat billing dibuat (sudah ada di billing engine). | Tinggi | Backend | ✅ |
| **H.1.6** | Rawat Inap → Billing | Auto-agregasi material usage ke billing items (sudah ada di billing engine). | Tinggi | Backend | ✅ |
| **H.1.7** | Kasir → Discharge | Implementasi billing gate yang block discharge jika payment_status != "paid" (sudah ada). | Tinggi | Backend | ✅ |
| **H.1.8** | Discharge → Rawat Inap | Auto-release bed (update bed_assignments.discharged = true) saat pasien dipulangkan (sudah ada). | Tinggi | Backend | ✅ |

#### H.2. Visit Status & Workflow Management

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **H.2.1** | Visit Lifecycle | Buat state machine untuk visit status (registered → in_examination → ready_for_billing → paid → completed). | Tinggi | Backend | ⏳ |
| **H.2.2** | Visit Lifecycle | Implementasi API untuk update visit status dengan validation (prevent invalid state transitions). | Tinggi | Backend | ⏳ |
| **H.2.3** | Queue Management | Implementasi real-time queue updates across modules (Admin register → Doctor queue updates). | Sedang | Fullstack | ⏳ |
| **H.2.4** | Data Sync | Ensure patient data updates di Registration module langsung reflect ke semua module. | Sedang | Backend | ⏳ |
| **H.2.5** | UGD Workflow | Alert/notification jika data pasien UGD express masih incomplete (perlu lengkapi NIK, alamat). | Sedang | Fullstack | ⏳ |

#### H.3. Role-Based Dashboards (Unified Views)

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **H.3.1** | Dashboard Framework | Buat reusable dashboard layout component dengan widget system untuk semua roles. | Tinggi | Frontend | ⏳ |
| **H.3.2** | Admin Dashboard | Tampilkan overview: total visits today, pending registrations, bed occupancy, revenue summary. | Sedang | Frontend | ⏳ |
| **H.3.3** | Doctor Dashboard | Tampilkan antrian pasien dari semua poli + quick access ke RME + riwayat pasien. | Tinggi | Frontend | ⏳ |
| **H.3.4** | Nurse Dashboard | Tampilkan bed occupancy + vital signs alerts + CPPT quick entry + daily tasks. | Sedang | Frontend | ⏳ |
| **H.3.5** | Pharmacist Dashboard | Tampilkan pending prescriptions + expiring drugs + low stock alerts (sudah ada). | Tinggi | Frontend | ✅ |
| **H.3.6** | Cashier Dashboard | Tampilkan pending billings + today's collections + payment history (sudah ada). | Tinggi | Frontend | ✅ |

#### H.4. User Experience & Navigation Enhancements

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **H.4.1** | Global Navigation | Buat **Quick Actions Header**: Button cepat untuk UGD Express Registration, Search Patient, Create Visit. | Tinggi | Frontend | ⏳ |
| **H.4.2** | RME Enhancement | Tampilkan riwayat RME pasien di sidebar/popup saat dokter buka RME baru. | Sedang | Frontend | ⏳ |
| **H.4.3** | Global Search | Implementasi global search bar di header untuk cari pasien (NIK/RM/Nama) dari mana saja. | Sedang | Fullstack | ⏳ |
| **H.4.4** | Breadcrumb Navigation | Implementasi breadcrumb navigation untuk track user location dalam nested pages. | Rendah | Frontend | ⏳ |
| **H.4.5** | Notification Center | Buat notification center di header untuk tampilkan semua notifikasi cross-module. | Sedang | Fullstack | ⏳ |

#### H.5. System Monitoring & Audit

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **H.5.1** | Audit Trail | Buat logging system untuk track semua perubahan critical data (RME locked, Payment processed, Discharge). | Sedang | Backend | ⏳ |
| **H.5.2** | Audit Trail | Buat database schema `audit_logs` untuk store semua audit trail. | Sedang | Backend | ⏳ |
| **H.5.3** | Audit Trail | Buat UI untuk admin melihat audit logs dengan filter by user, action, date range. | Rendah | Fullstack | ⏳ |
| **H.5.4** | System Health | Implementasi health check endpoint untuk monitor database connection, external services. | Rendah | Backend | ⏳ |

### I. Reporting & Analytics (Phase 2 Preparation)

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **I.1** | Backend | Buat API untuk **Daily Revenue Report** (total billing per hari, payment methods breakdown). | Rendah | Backend | ⏳ |
| **I.2** | Backend | Buat API untuk **Patient Visit Statistics** (total visits per hari/minggu/bulan, by visit type). | Rendah | Backend | ⏳ |
| **I.3** | Backend | Buat API untuk **Drug Usage Report** (most prescribed drugs, stock movement trends). | Rendah | Backend | ⏳ |
| **I.4** | Backend | Buat API untuk **Doctor Performance Report** (jumlah pasien handled, average examination time). | Rendah | Backend | ⏳ |
| **I.5** | Frontend | Buat **Dashboard Analytics** dengan charts untuk revenue, visits, dan occupancy rate. | Rendah | Frontend | ⏳ |

### J. RBAC (Role-Based Access Control)

| **No.** | **Kategori** | **Tugas Detail (Task)** | **Prio** | **Role** | **Status** |
| --- | --- | --- | --- | --- | --- |
| **J.1** | Backend/Types | Buat type system untuk roles dan permissions (UserRole, Permission, ROLE_PERMISSIONS). | Tinggi | Backend | ✅ |
| **J.2** | Backend/Types | Tambahkan **super_admin** role dengan akses penuh ke semua fitur dan permissions. | Tinggi | Backend | ✅ |
| **J.3** | Backend | Buat session utilities untuk get user role dan check permissions dari database. | Tinggi | Backend | ✅ |
| **J.4** | Backend | Buat RBAC middleware (requireAuth, requireRole, requirePermission, withRBAC). | Tinggi | Backend | ✅ |
| **J.5** | Backend | Buat API endpoint `/api/rbac/me` untuk fetch current user role dan permissions. | Tinggi | Backend | ✅ |
| **J.6** | Backend | Buat **database seeder** untuk default roles (admin, doctor, nurse, pharmacist, cashier, receptionist, super_admin). | Tinggi | Backend | ✅ |
| **J.7** | Backend | Buat **database seeder** untuk demo users dengan berbagai roles untuk testing. | Tinggi | Backend | ✅ |
| **J.8** | Backend | Buat **CRUD API untuk User Management** (create, read, update, delete users). | Tinggi | Backend | ✅ |
| **J.9** | Frontend | Buat **User Management UI** (list users, create user, edit user, delete user). | Tinggi | Frontend | ✅ |
| **J.10** | Frontend | Buat navigation configuration berdasarkan role (ROLE_NAVIGATION mapping). | Tinggi | Frontend | ✅ |
| **J.11** | Frontend | Buat role-based sidebar component yang dynamic based on user role. | Tinggi | Frontend | ✅ |
| **J.12** | Frontend | Buat role-based dashboard home dengan role-specific stats dan info. | Tinggi | Frontend | ✅ |
| **J.13** | Fullstack | Implementasi **role management UI** untuk admin assign/change roles ke users. | Sedang | Fullstack | ✅ |
| **J.14** | Backend | Protect semua existing API routes dengan RBAC middleware. | Tinggi | Backend | ⏳ |
| **J.15** | Backend | Update Better Auth configuration untuk include role data dalam session. | Sedang | Backend | ⏳ |

Daftar tugas ini sekarang mencakup semua yang dibutuhkan dari *setup* dasar, fitur-fitur krusial, hingga **integrasi antar-modul** untuk workflow yang mulus sesuai user journey, serta **RBAC** untuk security dan role-based workflows.