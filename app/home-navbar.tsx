"use client"

import Image from "next/image"
import Link from "next/link"
import { AuthButtons } from "@/components/auth-buttons"

export function HomeNavbar() {
  return (
    <nav className="hp-nav">
      <Link href="/" className="hp-nav-brand">
        <Image
          src="/bumi-andalas-logo.jpg"
          alt="Klinik Bumi Andalas"
          width={32}
          height={32}
          className="hp-nav-logo"
        />
        <span className="hp-nav-name">Klinik Bumi Andalas</span>
      </Link>
      <div className="hp-nav-actions">
        <AuthButtons />
      </div>
    </nav>
  )
}
