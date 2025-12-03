Dokumen **App Flow** ini sangat penting karena:

1.  Memastikan _User Experience_ (UX) yang sederhana dan logis.
2.  Mencegah _bottleneck_ atau _break_ dalam alur kerja antar-modul (misalnya, dari UGD ke Rawat Inap, atau dari RME ke Kasir).

Berikut adalah rancangan **App Flow / User Journey** utama untuk setiap peran pengguna di Fase 1:

---

## 🗺️ Dokumen App Flow (User Journey Map)

### 1. Alur Kunjungan Rawat Jalan Standar (Role: Admin $\rightarrow$ Dokter $\rightarrow$ Kasir)

| Langkah            | Aksi Pengguna (User)                                                                                | Sistem Memproses/Merender                                                                             | Modul       |
| :----------------- | :-------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :---------- |
| **1. Registrasi**  | Admin mencari/mendaftarkan pasien $\rightarrow$ Memilih Poli/Dokter $\rightarrow$ Mencetak Antrian. | Menambahkan entitas `Visit` ke DB.                                                                    | Pendaftaran |
| **2. Pemeriksaan** | Dokter melihat Antrian $\rightarrow$ Memanggil pasien $\rightarrow$ Mengakses RME.                  | Mengubah status `Visit` menjadi 'In Examination'. Memuat data `Medical_Records` pasien.               | RME         |
| **3. Dokumentasi** | Dokter mengisi SOAP, Diagnosis (ICD-10), dan Resep Digital.                                         | Membuat entitas `Medical_Records` $\rightarrow$ Membuat entitas `Prescriptions` (terkirim ke Apotek). | RME         |
| **4. Selesai**     | Dokter mengunci RME $\rightarrow$ Menentukan disposisi "Pulang".                                    | Mengubah status `Visit` menjadi 'Ready for Billing'.                                                  | RME         |
| **5. Pembayaran**  | Kasir mencari pasien di daftar _Billing Pending_ $\rightarrow$ Memproses rincian biaya.             | Billing Engine menarik semua biaya terkait `Visit`.                                                   | Kasir       |
| **6. Pulang**      | Kasir mencatat Pembayaran (Lunas) $\rightarrow$ Mencetak Kuitansi.                                  | Mengubah status `Billing` menjadi 'Paid' $\rightarrow$ Mengubah status `Visit` menjadi 'Completed'.   | Kasir       |

---

### 2. Alur Kunjungan Rawat Inap (RI) (Role: Admin $\rightarrow$ Perawat $\rightarrow$ Dokter $\rightarrow$ Kasir)

| Langkah                           | Aksi Pengguna (User)                                                                                                                   | Sistem Memproses/Merender                                                                                                                                       | Modul       |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| **1. Registrasi RI**              | Admin/UGD mendaftarkan pasien untuk RI (atau _transfer_ dari UGD/RJ) $\rightarrow$ Memilih jenis jaminan/pembayaran.                   | Membuat entitas `Visit` dengan `visit_type='RAWAT_INAP'`.                                                                                                       | Pendaftaran |
| **2. Alokasi Kamar**              | Perawat/Admin melihat **Dashboard Kamar** $\rightarrow$ Memilih/mengalokasikan Kamar/Bed.                                              | Membuat entitas `Inpatient_Stay` $\rightarrow$ Mengubah status kamar menjadi "Terisi".                                                                          | Rawat Inap  |
| **3. Perawatan Harian (Perawat)** | Perawat mencatat **Tanda-Tanda Vital** secara berkala (misal: per 8 jam).                                                              | Menyimpan data ke tabel `Vitals_History`.                                                                                                                       | Rawat Inap  |
| **4. Dokumentasi Harian**         | Perawat/Dokter mencatat **Catatan Perkembangan Pasien Terintegrasi (CPPT)**.                                                           | Menyimpan data ke `Medical_Records` (tipe CPPT).                                                                                                                | RME / RI    |
| **5. Pencatatan Biaya**           | Perawat/Dokter mencatat **pemakaian alat/material medis** atau tindakan perawat yang dikenakan biaya.                                  | Membuat entitas `Billing_Item` (Tindakan/Material) yang terasosiasi dengan `Visit`.                                                                             | RME / Kasir |
| **6. Perintah Dokter**            | Dokter memberikan perintah harian (obat, infus, pemeriksaan lab).                                                                      | Membuat `Prescriptions` (obat), `Service_Orders` (lab/tindakan).                                                                                                | RME         |
| **7. Keputusan Pulang**           | Dokter membuat keputusan "Pasien Pulang" (Discharge).                                                                                  | Mengunci semua RME/CPPT.                                                                                                                                        | RME         |
| **8. Ringkasan Medis**            | Dokter mengisi **Ringkasan Medis Pulang** (Resume Medis) dan instruksi kontrol.                                                        | Menyimpan data ke `Discharge_Summary` $\rightarrow$ Mengubah status `Visit` menjadi 'Ready for Billing'.                                                        | RME         |
| **9. Finalisasi Billing**         | Kasir mencari pasien RI $\rightarrow$ **Billing Engine** menghitung total biaya (termasuk Kamar Harian, Obat, Tindakan, dan Material). | Mengagregasi `Billing_Item` dari seluruh masa kunjungan RI.                                                                                                     | Kasir       |
| **10. Pulang**                    | Kasir menyelesaikan pembayaran (Lunas) $\rightarrow$ Admin/Kasir memproses **Pulang**.                                                 | Mengubah status `Billing` menjadi 'Paid' $\rightarrow$ Mengubah status `Visit` menjadi 'Completed' $\rightarrow$ Mengubah status kamar menjadi "Kosong/Bersih". | Kasir / RI  |

---

### 3. Alur Penanganan Gawat Darurat (UGD) (Role: Perawat/Admin $\rightarrow$ Dokter UGD)

| Langkah                      | Aksi Pengguna (User)                                                                                             | Sistem Memproses/Merender                                                                                 | Modul       |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :---------- |
| **1. Kedatangan Cepat**      | Perawat/Admin menggunakan **[UGD Cepat]** $\rightarrow$ Input Nama/Keluhan $\rightarrow$ Mencatat status Triage. | Membuat `Visit` dengan Triage Status (Merah/Kuning/Hijau) $\rightarrow$ Pasien muncul di Dashboard UGD.   | UGD         |
| **2. Penanganan**            | Dokter UGD melihat Dashboard $\rightarrow$ Memprioritaskan kasus Merah $\rightarrow$ Mengakses RME UGD.          | Memuat formulir RME UGD (fokus Tindakan Cepat & Observasi).                                               | UGD / RME   |
| **3. Disposisi (Keputusan)** | Dokter UGD menentukan: A. **Pulang**, B. **Rawat Jalan Lanjut**, atau C. **Rawat Inap**.                         | **A:** Mengubah status `Visit` ke 'Ready for Billing'. **B/C:** Memulai proses _handover_ ke modul RJ/RI. | UGD         |
| **4. Kelengkapan Data**      | Perawat/Admin melengkapi data Pasien yang didaftarkan cepat (NIK, Alamat, Jaminan) setelah kondisi stabil.       | Meng-update entitas `Patients` yang sudah ada.                                                            | Pendaftaran |

---

### 4. Alur Pelayanan Obat (Apotek) (Role: Dokter $\rightarrow$ Apoteker)

| Langkah                | Aksi Pengguna (User)                                                                                    | Sistem Memproses/Merender                                                                                 | Modul  |
| :--------------------- | :------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------- | :----- |
| **1. Resep Ditulis**   | Dokter selesai mengisi Resep Digital di RME dan menguncinya.                                            | Membuat entitas `Prescriptions` $\rightarrow$ Mengirim **Notifikasi Real-time** ke Apotek.                | RME    |
| **2. Persiapan Obat**  | Apoteker melihat Notifikasi $\rightarrow$ Mengakses Antrian Resep $\rightarrow$ Menyiapkan obat.        | Menampilkan detail Resep dan memastikan Stok Tersedia.                                                    | Apotek |
| **3. Penyerahan Obat** | Apoteker menyerahkan obat ke pasien/perawat $\rightarrow$ Menandai Resep sebagai **[Selesai/Fulfill]**. | Mengubah status `Prescription` menjadi 'Fulfilled' $\rightarrow$ **Mengurangi stok** di `Drug_Inventory`. | Apotek |
| **4. Tagihan**         | Biaya obat otomatis masuk ke rincian `Billing` pasien.                                                  | Billing Engine mengambil harga dari `Prescriptions`.                                                      | Kasir  |

---

### 5. Alur Manajemen Stok Obat (Role: Apoteker)

| Langkah                      | Aksi Pengguna (User)                                                                   | Sistem Memproses/Merender                                                                                          | Modul  |
| :--------------------------- | :------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :----- |
| **1. Stok Masuk**            | Apoteker menginput kedatangan stok baru (termasuk Batch No. dan Exp. Date).            | Membuat entitas `Drug_Inventory` baru $\rightarrow$ Menambah stok di sistem.                                       | Apotek |
| **2. Peringatan Dini**       | Sistem secara otomatis menjalankan _logic_ (misalnya harian) untuk mengecek Exp. Date. | Apoteker melihat **Widget Merah/Kuning** di dashboard yang menampilkan obat yang mendekati kadaluarsa (< 30 hari). | Apotek |
| **3. Stok Keluar Non-Resep** | Apoteker mencatat obat yang rusak/dibuang/dipakai non-resep.                           | Membuat entitas `Drug_Inventory_Log` $\rightarrow$ Mengurangi `current_stock`.                                     | Apotek |

---
