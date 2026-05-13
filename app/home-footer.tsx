import Image from "next/image"

export function HomeFooter() {
  return (
    <footer className="hp-footer">
      <div className="hp-footer-brand">
        <Image
          src="/bumi-andalas-logo.jpg"
          alt="Klinik Bumi Andalas"
          width={24}
          height={24}
          className="hp-footer-logo"
        />
        <span className="hp-footer-name">Klinik Bumi Andalas</span>
      </div>
      <span className="hp-footer-copy">
        © {new Date().getFullYear()} Klinik Bumi Andalas. All rights reserved.
      </span>
    </footer>
  )
}
