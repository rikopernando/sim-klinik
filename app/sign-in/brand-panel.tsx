"use client"

import { ne } from "drizzle-orm"
import { FileText, Activity, TrendingUp } from "lucide-react"

const FEATURES = [
  {
    icon: <FileText size={14} />,
    label: "Rekam Medis Digital",
    value: "SOAP notes, diagnosis ICD-10, dan resep terintegrasi",
  },
  {
    icon: <Activity size={14} />,
    label: "Monitoring Real-time",
    value: "Pantau antrian, rawat inap, dan UGD secara langsung",
  },
  {
    icon: <TrendingUp size={14} />,
    label: "Laporan Keuangan",
    value: "Analitik pendapatan, tagihan, dan koleksi otomatis",
  },
]

export function BrandPanel() {
  return (
    <div className="sk-panel">
      <div className="sk-orb sk-orb-1" />
      <div className="sk-orb sk-orb-2" />
      <div className="sk-orb sk-orb-3" />
      <div className="sk-orb sk-orb-4" />
      <div className="sk-orb sk-orb-5" />
      <div className="sk-grid" />

      <div className="sk-brand">
        <div className="sk-brand-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bumi-andalas-logo.jpg" alt="Klinik Bumi Andalas" className="sk-logo" />
          <div>
            <div className="sk-brand-name">Klinik Bumi Andalas</div>
            <div className="sk-brand-tagline">Sistem Informasi Klinik</div>
          </div>
        </div>

        <div className="sk-status">
          <span className="sk-dot" />
          Sistem Online
        </div>

        <h1 className="sk-headline">
          Satu sistem untuk
          <br />
          <em>seluruh klinik.</em>
        </h1>

        <p className="sk-subhead">
          Kelola antrian, rekam medis, farmasi, laboratorium, dan keuangan klinik dalam satu
          platform terpadu.
        </p>

        <div className="sk-features">
          {FEATURES.map(({ icon, label, value }) => (
            <div key={label} className="sk-feat">
              <div className="sk-feat-icon">{icon}</div>
              <div>
                <div className="sk-feat-label">{label}</div>
                <div className="sk-feat-value">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sk-panel-footer">
        © {new Date().getFullYear()} Klinik Bumi Andalas. All rights reserved.
      </div>
    </div>
  )
}
