const STATS = [
  { value: "10+", label: "Modul Terintegrasi" },
  { value: "7", label: "Role Pengguna" },
  { value: "100%", label: "Berbasis Browser" },
]

export function HomeStats() {
  return (
    <section className="hp-stats-section">
      <div className="hp-stats-inner">
        {STATS.map(({ value, label }) => (
          <div key={label} className="hp-stat-item">
            <div className="hp-stat-value">{value}</div>
            <div className="hp-stat-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
