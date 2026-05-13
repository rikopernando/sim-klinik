"use client"

import Image from "next/image"
import { HeroAuthButtons } from "@/components/auth-buttons"

const STAT_CHIPS = ["10 Modul Terintegrasi", "Real-time Monitoring", "Multi-role Access"]

export function HomeHero() {
  return (
    <section className="hp-hero">
      <div className="hp-orb hp-orb-1" />
      <div className="hp-orb hp-orb-2" />
      <div className="hp-orb hp-orb-3" />
      <div className="hp-orb hp-orb-4" />
      <div className="hp-orb hp-orb-5" />
      <div className="hp-grid" />

      <div className="hp-hero-content">
        <Image
          src="/bumi-andalas-logo.jpg"
          alt="Klinik Bumi Andalas"
          width={68}
          height={68}
          className="hp-hero-logo"
        />

        <div className="hp-status">
          <span className="hp-dot" />
          Sistem Aktif
        </div>

        <h1 className="hp-headline">
          Satu platform untuk
          <br />
          <em>seluruh operasional klinik.</em>
        </h1>

        <p className="hp-subhead">
          Kelola antrian, rekam medis, farmasi, laboratorium, dan keuangan — dalam satu sistem
          terpadu yang mudah digunakan.
        </p>

        <div className="hp-cta-wrap">
          <HeroAuthButtons />
        </div>

        <div className="hp-stat-chips">
          {STAT_CHIPS.map((label) => (
            <span key={label} className="hp-chip">
              <span className="hp-chip-dot" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
