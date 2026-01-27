### Revisi on Pendaftaran dan Antrian

1. Pendaftaran Pasien Baru
   - ✅ Setiap Kolom full width
   - ✅ Kolom Input Jenis Kelamin ganti menggunakan Radio Button, hanya berisi 2 opsi, Laki-laki dan perempuan
   - ✅ Kolom Input tanggal lahir, ganti menggunakan Component Calendar, daripada menggunakan date picker biasa
   - ✅ Kolom NIK wajib diisi, harus 16 digit
   - ✅ gunakan axios untuk fetch data dari API
   - ✅ Jika ada error validation atau error apapun dari API, tampilkan error yang informatif
   - ✅ Pastikan semuanya mobile responsive
   - ✅ Lakukan code refactoring jika diperlukan, agar supaya codenya lebih clean, lebih readable dan lebih modular
   - ✅ Form menggunakan grid layout 2 kolom (md:grid-cols-2) untuk desktop, 1 kolom untuk mobile
   - ✅ Field yang panjang (Address, Allergies, Chief Complaint) menggunakan md:col-span-2
   - ✅ Calendar component dengan year picker dan month picker (captionLayout="dropdown", fromYear=1900, toYear=current year)
   - ✅ Jika Jenis Jaminan Tidak sama dengan Umum, maka Nomor Jaminan wajib diisi (conditional validation dengan Zod refine)
   - ✅ Pastikan codenya lebih clean, lebih readable dan lebih modular. Terapkan prinsip DRY
   - ✅ Validasi form visit registrasi di FE dengan Zod refine:
     - ✅ Rawat Jalan: Poli wajib dipilih
     - ✅ Rawat Inap: Kamar wajib dipilih
     - ✅ UGD: Keluhan Utama wajib diisi
     - ✅ Error messages ditampilkan di bawah setiap field
     - ✅ Border merah pada field yang error

How to Access the Medical Record Page:

The RME page URL pattern is:
/dashboard/medical-records/[visitId]

Step-by-Step:

1. First, register a patient visit (if you haven't already):
   - Go to: http://localhost:3000/dashboard/registration
   - Search for an existing patient OR register a new one
   - Register a visit (Rawat Jalan, Rawat Inap, or UGD)
   - Note the visit ID from the response

2. Then access the medical record:
   - Go to: http://localhost:3000/dashboard/medical-records/[visitId]
   - Replace [visitId] with the actual visit ID number
   - Example: http://localhost:3000/dashboard/medical-records/1

Alternative: Create a Queue Page to Select Patients

Since you probably want a better workflow, let me create a simple queue page where doctors can see their patients and click to open the
medical record:

Would you like me to create:

1. A queue/dashboard page where you can see today's visits and click to open the medical record?
2. Or just test directly by going to /dashboard/medical-records/1 (assuming you have a visit with ID 1)?
