import "./home.css"
import { HomeNavbar } from "./home-navbar"
import { HomeHero } from "./home-hero"
import { HomeFeatures } from "./home-features"
import { HomeStats } from "./home-stats"
import { HomeCta } from "./home-cta"
import { HomeFooter } from "./home-footer"

export default function Home() {
  return (
    <div className="hp-root">
      <HomeNavbar />
      <HomeHero />
      <HomeFeatures />
      <HomeStats />
      <HomeCta />
      <HomeFooter />
    </div>
  )
}
