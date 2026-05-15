Saya sedang menyelidiki lonjakan penggunaan Egress Bandwidth pada proyek Supabase saya yang mencapai 5.5GB (batas paket Free Tier). Saya mencurigai adanya query yang tidak efisien atau "kebocoran" data di sisi aplikasi yang memicu bandwidth besar.

Tugas kamu adalah membantu saya melakukan audit kode untuk menemukan penyebabnya:

1. Identifikasi semua query yang menggunakan `db.select()` (Drizzle ORM) di seluruh codebase.
2. Fokus pada query yang:
   - Melakukan `select()` tanpa argumen (yang berarti `SELECT *`).
   - Tidak menggunakan `.limit()` atau `.offset()` pada tabel-tabel besar seperti 'medical_records', 'lab_results', 'visits' atau tabel historis lainnya.
   - Digunakan di dalam komponen React/Client side (langsung atau via API) yang mungkin memicu _fetch_ berulang kali.
3. Bantu saya menyarankan optimasi berupa:
   - Menentukan kolom yang hanya dibutuhkan saja (projection) alih-alih `*`.
   - Mengimplementasikan _pagination_ (limit/offset) pada query tersebut.
4. Cek apakah ada fungsi `useEffect` atau `useQuery` (React Query) yang memicu _data fetching_ tanpa _dependency array_ yang tepat, yang berpotensi menyebabkan _infinite loop_ saat di-mount di browser.

Tolong berikan daftar file atau fungsi yang paling mencurigakan dan usulan perbaikannya.
