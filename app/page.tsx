"use client"

import Image from "next/image"

import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButtons, HeroAuthButtons } from "@/components/auth-buttons"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative px-4 py-12 text-center sm:py-16">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>

        <div className="mb-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Image
            src="/bumi-andalas-logo-v2.png"
            alt="Klinik Bumi Andalas Logo"
            width={50}
            height={50}
            className="rounded-xl sm:h-[60px] sm:w-[60px]"
          />
          <h1 className="text-primary font-parkinsans bg-gradient-to-r bg-clip-text text-3xl font-bold sm:text-4xl lg:text-5xl">
            Klinik Bumi Andalas
          </h1>
        </div>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl px-4 text-lg sm:text-xl">
          Simulasi Klinik Terpadu untuk Manajemen Klinik Modern
        </p>

        <HeroAuthButtons />

        {/* Features Section */}
        <div className="mx-auto mt-20 max-w-6xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">Fitur Sistem Klinik</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 transition-shadow hover:shadow-lg">
              <CardContent className="p-0 text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-2xl">🏥</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Registrasi & Antrian</h3>
                <p className="text-muted-foreground text-sm">
                  Manajemen pendaftaran pasien dan sistem antrian terpadu
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 transition-shadow hover:shadow-lg">
              <CardContent className="p-0 text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Rekam Medis Elektronik</h3>
                <p className="text-muted-foreground text-sm">
                  Dokumentasi medis digital berbasis SOAP
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 transition-shadow hover:shadow-lg">
              <CardContent className="p-0 text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-2xl">💊</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Farmasi & Obat</h3>
                <p className="text-muted-foreground text-sm">
                  Manajemen stok obat dan resep terintegrasi
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 transition-shadow hover:shadow-lg">
              <CardContent className="p-0 text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Billing & Keuangan</h3>
                <p className="text-muted-foreground text-sm">
                  Sistem penagihan dan manajemen keuangan klinik
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* About Section */}
        <div className="mx-auto mt-20 max-w-4xl px-4 py-12">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Tentang Simulasi Klinik</h2>
            <p className="text-muted-foreground text-lg">
              Platform simulasi klinik yang dirancang untuk mendukung manajemen klinik secara
              efektif dan efisien. Sistem ini membantu administrator klinik dalam memahami dan
              mengoptimalkan alur kerja klinik secara menyeluruh.
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xl font-semibold">Misi Kami</h3>
              <p className="text-muted-foreground mb-4">
                Menyediakan solusi manajemen klinik yang efektif dan efisien dengan memanfaatkan
                teknologi informasi terkini untuk meningkatkan kualitas layanan kesehatan.
              </p>
              <h3 className="mb-4 text-xl font-semibold">Target Pengguna</h3>
              <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                <li>Administrator Klinik</li>
                <li>Pemilik Klinik</li>
                <li>Manajer Operasional Klinik</li>
                <li>Staff Administrasi Klinik</li>
              </ul>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-700">
              <h3 className="mb-4 text-xl font-semibold">Apa yang Membuat Kami Berbeda</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Antarmuka intuitif sesuai prinsip Simple UX</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Desain responsif untuk berbagai perangkat</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Alur kerja terintegrasi dari registrasi hingga discharge</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Fitur pelaporan dan analitik komprehensif</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 dark:bg-primary/10 mx-auto mt-20 max-w-4xl rounded-xl px-4 py-12">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            Optimalkan Manajemen Klinik Anda
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-center text-lg">
            Tingkatkan efisiensi operasional klinik dengan sistem manajemen terpadu kami
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <HeroAuthButtons />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-muted-foreground py-8 text-center text-sm">
        <p>
          © {new Date().getFullYear()} Sim-Klinik - Klinik Bumi Andalas. Platform Simulasi Klinik
          untuk Manajemen Klinik.
        </p>
      </footer>
    </div>
  )
}
