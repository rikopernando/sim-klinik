"use client"

import { HeroAuthButtons } from "@/components/auth-buttons"

export function HomeCta() {
  return (
    <section className="hp-cta-section">
      <div className="hp-orb hp-orb-1" style={{ opacity: 0.35 }} />
      <div className="hp-orb hp-orb-2" style={{ opacity: 0.35 }} />
      <div className="hp-grid" />
      <div className="hp-cta-content">
        <h2 className="hp-cta-title">Siap mengelola klinik lebih efisien?</h2>
        <p className="hp-cta-sub">Masuk sekarang dan mulai manajemen klinik modern Anda.</p>
        <HeroAuthButtons />
      </div>
    </section>
  )
}
