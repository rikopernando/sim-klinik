import { Users, FileText, Pill, FlaskConical, BedDouble, TrendingUp } from "lucide-react"

const FEATURES = [
  {
    icon: <Users size={20} />,
    title: "Registrasi & Antrian",
    desc: "Pendaftaran pasien cepat dengan sistem antrian digital per poli",
  },
  {
    icon: <FileText size={20} />,
    title: "Rekam Medis Elektronik",
    desc: "SOAP notes, diagnosis ICD-10, dan prosedur ICD-9 terintegrasi",
  },
  {
    icon: <Pill size={20} />,
    title: "Farmasi & Apotek",
    desc: "Manajemen stok obat, resep elektronik, dan dispensing terintegrasi",
  },
  {
    icon: <FlaskConical size={20} />,
    title: "Laboratorium",
    desc: "Permintaan lab, input hasil, dan notifikasi dokter secara real-time",
  },
  {
    icon: <BedDouble size={20} />,
    title: "Rawat Inap",
    desc: "Manajemen kamar, bed, dan CPPT untuk pasien rawat inap",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "Laporan & Keuangan",
    desc: "Analitik pendapatan, tagihan, dan koleksi pembayaran otomatis",
  },
]

export function HomeFeatures() {
  return (
    <section className="hp-features-section">
      <span className="hp-section-label">Fitur Lengkap</span>
      <h2 className="hp-section-title">Semua yang Anda butuhkan</h2>
      <p className="hp-section-desc">
        Platform terintegrasi untuk seluruh alur kerja klinik, dari registrasi hingga laporan
        keuangan.
      </p>

      <div className="hp-features-grid">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="hp-feat-card">
            <div className="hp-feat-icon">{icon}</div>
            <div className="hp-feat-title">{title}</div>
            <div className="hp-feat-desc">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
