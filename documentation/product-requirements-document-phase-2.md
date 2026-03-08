# Product Requirements Document (PRD) - Phase 2: Ekspansi & Integrasi

Setelah Phase 1 (Sistem Inti Klinik) selesai, fokus kita di **Phase 2** adalah **Interoperabilitas (Integrasi), Pengalaman Pasien Mandiri (Engagement), dan Analisis Data (Intelligence)**.

Berikut adalah Dokumen PRD untuk Phase 2:

---

## 📄 Product Requirements Document (PRD) - Phase 2: Ekspansi & Integrasi

### 1. Ringkasan Eksekutif

Phase 2 bertujuan untuk menghubungkan klinik dengan ekosistem kesehatan nasional, memperluas layanan ke arah penunjang (Laboratorium), dan memberikan akses digital langsung kepada pasien untuk meningkatkan loyalitas serta transparansi.

---

### 2. Sasaran (Goals) dan Metrik Kunci (KPI)

| **Sasaran (SMART)**             | **Metrik Kunci (KPI)**                                                   |
| ------------------------------- | ------------------------------------------------------------------------ |
| **Kepatuhan Regulasi Nasional** | Terintegrasi 100% dengan **SatuSehat (Kemenkes)**.                       |
| **Peningkatan Efisiensi Klaim** | Pengurangan waktu proses klaim asuransi/BPJS sebesar 40%.                |
| **Engagement Pasien**           | 30% dari total pendaftaran pasien dilakukan secara mandiri via aplikasi. |
| **Akurasi Data Penunjang**      | 100% hasil Lab tersedia secara digital di RME dokter tanpa input manual. |

---

### 3. Fitur Utama Phase 2

### A. Integrasi SatuSehat (Kemenkes RI)

- **Deskripsi:** Menghubungkan RME klinik dengan platform SatuSehat menggunakan standar HL7 FHIR.
- **Fitur Kunci:**
  - Sinkronisasi otomatis data kunjungan dan diagnosa ke server Kemenkes.
  - Pertukaran data resume medis antar faskes secara aman.

### B. Modul Laboratorium & Radiologi (LIS/RIS)

- **Deskripsi:** Digitalisasi permintaan dan hasil pemeriksaan penunjang.
- **Fitur Kunci:**
  - **Order Digital:** Dokter mengirim permintaan lab langsung dari layar RME.
  - **Input Hasil Lab:** Petugas lab mengunggah hasil (PDF/Gambar) atau input parameter nilai.
  - **Notifikasi Hasil:** Dokter menerima notifikasi saat hasil pemeriksaan sudah siap.

### C. Integrasi BPJS Kesehatan (P-Care / VClaim)

- **Deskripsi:** Memudahkan verifikasi dan klaim pasien peserta BPJS.
- **Fitur Kunci:**
  - Verifikasi kepesertaan otomatis via NIK.
  - Sinkronisasi data kunjungan untuk keperluan klaim biaya ke BPJS.

### D. Portal Pasien (Mobile PWA)

- **Deskripsi:** Memberikan akses kontrol kepada pasien atas kesehatan mereka.
- **Fitur Kunci:**
  - **Booking Online:** Pasien dapat mendaftar dari rumah untuk menghindari antrian fisik.
  - **Riwayat Medis Mandiri:** Pasien dapat melihat hasil lab dan riwayat resep mereka sendiri.
  - **E-Education:** Artikel kesehatan yang relevan dengan kondisi pasien.

### E. Dashboard Analytics (Business Intelligence)

- **Deskripsi:** Alat bantu bagi pemilik klinik untuk pengambilan keputusan berbasis data.
- **Fitur Kunci:**
  - Visualisasi grafik kunjungan harian/bulanan.
  - Laporan penyakit terbanyak (Top 10 Diagnosa).
  - Laporan arus kas dan efektivitas stok obat.

---

### 4. User Stories Phase 2

| **No.** | **User Story**                                                                                                                                                               |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2.1** | **Sebagai Pemilik Klinik**, saya ingin melihat laporan pendapatan dan penyakit terbanyak secara _real-time_ agar saya bisa merencanakan stok obat dan SDM dengan lebih baik. |
| **2.2** | **Sebagai Dokter**, saya ingin hasil lab pasien muncul otomatis di layar RME saya agar saya tidak perlu mencari kertas hasil fisik dan bisa mendiagnosa lebih cepat.         |
| **2.3** | **Sebagai Pasien**, saya ingin mendaftar kunjungan melalui ponsel saya dari rumah agar saya tahu jam berapa saya harus datang dan tidak menunggu terlalu lama di klinik.     |
| **2.4** | **Sebagai Admin**, saya ingin sistem mengirimkan data kunjungan secara otomatis ke SatuSehat agar klinik tetap patuh pada regulasi pemerintah tanpa kerja manual tambahan.   |
| **2.5** | **Sebagai Kasir**, saya ingin verifikasi asuransi/BPJS dilakukan otomatis di sistem agar tidak terjadi kesalahan input data kepesertaan.                                     |

---

### 5. Persyaratan Teknis & Integrasi (Update TDD)

| **Kategori**          | **Teknologi/Standar**           | **Keterangan**                                                                          |
| --------------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| **Interoperabilitas** | **HL7 FHIR & JSON**             | Standar wajib untuk integrasi SatuSehat Kemenkes.                                       |
| **API Integration**   | **Supabase Edge Functions**     | Digunakan untuk menangani _webhooks_ dan integrasi API pihak ketiga (BPJS/SatuSehat).   |
| **Storage**           | **Supabase Storage**            | Untuk menyimpan file hasil Lab/Radiologi (PDF/DICOM/JPG).                               |
| **Security**          | **OAuth2 / API Key Management** | Protokol keamanan untuk komunikasi antar sistem.                                        |
| **Frontend Pasien**   | **Next.js PWA**                 | Aplikasi ringan yang bisa di-_install_ di HP pasien tanpa melalui Play Store/App Store. |

---

### 6. Rencana Implementasi Phase 2

1. **Bulan 1:** Pengembangan Modul Laboratorium & Dashboard Internal.
2. **Bulan 2:** Integrasi API SatuSehat dan BPJS Kesehatan (Uji Coba Sandbox).
3. **Bulan 3:** Pengembangan Portal Pasien (PWA) dan Peluncuran Fitur Booking Online.

---

### Kesimpulan

Phase 2 akan mengubah klinik Anda dari sekadar sistem pencatatan internal menjadi **Smart Clinic** yang terhubung dengan ekosistem kesehatan nasional. Penggunaan **Supabase** akan sangat memudahkan di fase ini, terutama dengan fitur **Edge Functions** untuk integrasi API dan **Storage** untuk file laboratorium.

Apakah Anda ingin saya memberikan detail teknis mengenai **Integrasi SatuSehat** (seperti struktur JSON HL7 FHIR-nya) untuk persiapan tim backend?
