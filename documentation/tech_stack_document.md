Dokumen ini menjelaskan "bagaimana" produk akan dibangun dari sudut pandang teknis.

**1. Arsitektur Sistem**

Kami akan menggunakan arsitektur **3-Tier** dengan pendekatan **Monolitik Modular** di Next.js:
1. **Presentation Tier (Frontend):** Antarmuka pengguna yang dibangun dengan React.js/Next.js. Bertanggung jawab atas rendering dan interaksi pengguna.
2. **Application Tier (Backend/API):** API Routes di Next.js. Bertanggung jawab atas logika bisnis, otorisasi, dan berinteraksi dengan Database.
3. **Data Tier (Database):** PostgreSQL di AWS RDS. Bertanggung jawab atas penyimpanan dan pengambilan data yang persisten.

**2. Strategi Keamanan Teknis**

1. **Otentikasi:** Penggunaan **JWT (JSON Web Tokens)** untuk *session management*. Token disimpan di **HTT-Only Cookies**.
2. **Autorisasi (RBAC):** Cek izin pengguna harus dilakukan di **setiap API Route** (Backend) sebelum mengakses atau memanipulasi data sensitif.
3. **ORM/Query Builder:** Gunakan **ORM (Object-Relational Mapping)** atau *Query Builder* (misalnya Prisma, Knex) untuk berinteraksi dengan PostgreSQL. Ini **WAJIB** untuk mencegah serangan **SQL Injection**.
4. **Enkripsi SSL/TLS:** Pastikan **HTTPS** dikonfigurasi di AWS *Load Balancer* atau *CDN* (seperti CloudFront) untuk mengenkripsi data saat transit.

**6. Strategi Deployment**

• **Lingkungan:** Pengembangan (*Development*), Pengujian (*Staging*), Produksi (*Production*).
• **Git:** Penggunaan **Git (misalnya, GitHub/GitLab)** dengan strategi *branching* yang jelas (misalnya, Git Flow).
• **Deployment Next.js:** Untuk awal, pertimbangkan **Vercel** (jika menggunakan serverless API) atau **AWS ECS/EC2** (jika ingin *full control* atas *container*).

---

## 🛠️ I. Update Dokumen Teknis (Technical Design Document - TDD)

### 1. Tumpukan Teknologi (Revised)

| **Kategori** | **Teknologi** | **Versi Kunci** | **Tujuan / Benefit** |
| --- | --- | --- | --- |
| **Frontend Framework** | **React.js** | Terbaru | Dasar untuk membangun UI yang dinamis dan modular. |
| **Full-Stack Framework** | **Next.js** | Terbaru | Untuk *Routing*, *Server-Side Rendering* (SSR) / *Static Site Generation* (SSG), dan API Routes (Backend). |
| **Styling** | **Tailwind CSS** | Terbaru | Framework CSS *utility-first* untuk kecepatan desain dan memastikan konsistensi (*Simple UX*). |
| **UI Components** | **Headless UI** (atau Radix UI) | - | Untuk membangun komponen interaktif (Dropdown, Modal, Tabs) yang aksesibel tanpa styling bawaan, sehingga mudah dikustomisasi dengan Tailwind. |
| **Database** | **PostgreSQL** | Terbaru | Database relasional yang kuat, *reliable*, dan *open-source*. |
| **ORM / Querying** | **Prisma** | Terbaru | ORM modern untuk interaksi database yang *type-safe* dan mencegah SQL Injection. |
| **State Management** | **Zustand** (atau Jotai) | - | Solusi *state management* yang ringan (dibanding Redux) dan sederhana untuk *client-side* global *state*. |

### 2. Framework & Library Kunci (Detail)

### A. Otentikasi & Otorisasi (Auth & RBAC)

- **Library:** **NextAuth.js (Auth.js)**
    - **Tujuan:** Menyediakan solusi otentikasi yang mudah diintegrasikan dengan Next.js dan mendukung strategi JWT serta kredensial database.
    - **Fitur Kunci:** Integrasi *hashing* kata sandi yang aman (bcrypt) dan manajemen sesi berbasis JWT.
- **Implementasi RBAC:** Logika Otorisasi (Role-Based Access Control) akan diimplementasikan pada **Next.js Middleware** dan **API Routes** menggunakan peran yang disimpan di database (`users.role`).

### B. Validasi Formulir

- **Library:** **React Hook Form** dan **Zod**
    - **Tujuan:** Mengelola status formulir dan validasi input. Ini penting untuk memastikan data yang dimasukkan (misalnya di RME atau Pendaftaran) valid.
    - **Benefit UX:** Mengurangi *boilerplate* dan memberikan *feedback* validasi yang cepat kepada pengguna.

### C. Data Fetching

- **Library:** **React Query (TanStack Query)**
    - **Tujuan:** Mengelola *caching*, sinkronisasi, dan *state* server (data dari API) secara efisien.
    - **Benefit UX:** Membuat aplikasi terasa lebih cepat dan stabil karena data disimpan di *cache* sementara (misalnya, daftar pasien saat mencari).

### D. Desain & Komponen

- **Styling:** **Tailwind CSS**
    - **Implementasi:** Digunakan untuk membangun antarmuka yang bersih dan minimalis (*Simple UX*). Akan dibuat *custom design system* di Tailwind untuk warna, *spacing*, dan tipografi klinik.

---

## 💾 II. Entity-Relationship Diagram (ERD) / Desain Database

Berikut adalah rancangan ERD untuk skema inti (fase 1) menggunakan PostgreSQL. Fokus pada entitas utama dan relasinya.

### 1. Entitas Utama (Tabel)

### A. Users (Pengguna)

| **Kolom** | **Tipe Data** | **Keterangan** |
| --- | --- | --- |
| `user_id` | `UUID` / `SERIAL` | **Primary Key** |
| `username` | `VARCHAR(50)` | Unik, untuk login |
| `password_hash` | `TEXT` | Hash kata sandi (bcrypt) |
| `role` | `ENUM` | **('ADMIN', 'DOKTER', 'PERAWAT', 'APOTEKER', 'KASIR')** |
| `is_active` | `BOOLEAN` | Status akun |

### B. Patients (Pasien)

| **Kolom** | **Tipe Data** | **Keterangan** |
| --- | --- | --- |
| `patient_id` | `UUID` / `SERIAL` | **Primary Key** |
| `mr_number` | `VARCHAR(10)` | **Unique** |
| `full_name` | `VARCHAR(255)` |  |
| `nik` | `VARCHAR(16)` | *Enkripsi disarankan untuk PHI* |
| `date_of_birth` | `DATE` |  |
| `address` | `TEXT` |  |
| `phone_number` | `VARCHAR(20)` |  |

### C. Visits (Kunjungan)

| **Kolom** | **Tipe Data** | **Keterangan** |
| --- | --- | --- |
| `visit_id` | `UUID` / `SERIAL` | **Primary Key** |
| `patient_id` | `UUID` | **Foreign Key** ke `patients` |
| `visit_type` | `ENUM` | **('RAWAT_JALAN', 'RAWAT_INAP', 'UGD')** |
| `triage_status` | `ENUM` | (NULL kecuali UGD) **('MERAH', 'KUNING', 'HIJAU')** |
| `visit_status` | `ENUM` | **('REGISTERED', 'EXAMINATION', 'BILLING', 'COMPLETED')** |
| `doctor_id` | `UUID` | **Foreign Key** ke `users` (Dokter yang menangani) |

### D. Medical_Records (RME)

| **Kolom** | **Tipe Data** | **Keterangan** |
| --- | --- | --- |
| `record_id` | `UUID` / `SERIAL` | **Primary Key** |
| `visit_id` | `UUID` | **Foreign Key** ke `visits` |
| `soap_s` | `TEXT` | Subjektif |
| `soap_o` | `TEXT` | Objektif |
| `assessment` | `TEXT` | Analisis / Diagnosis Utama |
| `plan` | `TEXT` | Rencana Tatalaksana |
| `icd10_code` | `VARCHAR(10)` | Kode Diagnosis |
| `is_locked` | `BOOLEAN` | True jika Dokter sudah mengunci RME |

### E. Drugs (Data Master Obat)

| **Kolom** | **Tipe Data** | **Keterangan** |
| --- | --- | --- |
| `drug_id` | `UUID` / `SERIAL` | **Primary Key** |
| `drug_name` | `VARCHAR(150)` | Nama Obat |
| `unit_price` | `NUMERIC` | Harga Jual Satuan |

### F. Drug_Inventory (Stok Obat)

| **Kolom** | **Tipe Data** | **Keterangan** |
| --- | --- | --- |
| `inventory_id` | `UUID` / `SERIAL` | **Primary Key** |
| `drug_id` | `UUID` | **Foreign Key** ke `drugs` |
| `batch_number` | `VARCHAR(50)` | Nomor Batch |
| `expiration_date` | `DATE` | Tanggal Kadaluarsa |
| `current_stock` | `INTEGER` | Kuantitas Saat Ini |

### G. Prescriptions (Resep)

| **Kolom** | **Tipe Data** | **Keterangan** |
| --- | --- | --- |
| `prescription_id` | `UUID` / `SERIAL` | **Primary Key** |
| `record_id` | `UUID` | **Foreign Key** ke `medical_records` |
| `drug_id` | `UUID` | **Foreign Key** ke `drugs` |
| `quantity` | `INTEGER` | Jumlah yang diresepkan |
| `dosage` | `VARCHAR(50)` | Dosis dan Aturan Pakai |
| `is_fulfilled` | `BOOLEAN` | True jika sudah diambil Apotek |

### H. Billings (Tagihan)

| **Kolom** | **Tipe Data** | **Keterangan** |
| --- | --- | --- |
| `billing_id` | `UUID` / `SERIAL` | **Primary Key** |
| `visit_id` | `UUID` | **Foreign Key** ke `visits` |
| `total_amount` | `NUMERIC` | Total biaya sebelum diskon |
| `final_amount` | `NUMERIC` | Total yang harus dibayar pasien |
| `payment_status` | `ENUM` | **('PENDING', 'PAID', 'CANCELED')** |
| `payment_method` | `ENUM` | (NULL jika Pending) |

### 2. Gambaran ERD

Berikut adalah gambaran relasi utama antara entitas:

```jsx
$$\begin{array}{rcl}
\text{Patients} & \stackrel{1:N}{\longrightarrow} & \text{Visits} \\
\text{Visits} & \stackrel{1:1}{\longrightarrow} & \text{Medical\_Records} \\
\text{Visits} & \stackrel{1:1}{\longrightarrow} & \text{Billings} \\
\text{Medical\_Records} & \stackrel{1:N}{\longrightarrow} & \text{Prescriptions} \\
\text{Drugs} & \stackrel{1:N}{\longrightarrow} & \text{Drug\_Inventory} \\
\text{Drugs} & \stackrel{1:N}{\longrightarrow} & \text{Prescriptions} \\
\text{Users} & \stackrel{1:N}{\longrightarrow} & \text{Visits} \text{ (Dokter)} \\
\end{array}$$
```

**Penjelasan Relasi Kunci:**

1. **Patient & Visit (1:N):** Satu pasien dapat memiliki banyak kunjungan.
2. **Visit & RME (1:1):** Setiap kunjungan unik menghasilkan satu *medical record* utama.
3. **Visit & Billing (1:1):** Setiap kunjungan akan menghasilkan satu tagihan akhir.
4. **RME & Prescription (1:N):** Satu *medical record* dapat mencakup banyak resep obat.
5. **Drugs & Inventory/Prescription (1:N):** Data master obat (`Drugs`) direferensikan oleh stok (`Drug_Inventory`) dan resep (`Prescriptions`).

Dokumen teknis yang telah direvisi ini, bersama dengan desain ERD, sudah sangat siap untuk menjadi *blueprint* bagi tim pengembang Anda. Langkah selanjutnya adalah memulai *sprint* desain dan *development*!