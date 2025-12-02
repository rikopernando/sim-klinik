"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons, HeroAuthButtons } from "@/components/auth-buttons";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <Image
            src="/bumi-andalas-logo.jpg"
            alt="Klinik Bumi Andalas Logo"
            width={50}
            height={50}
            className="rounded-xl sm:w-[60px] sm:h-[60px]"
          />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r text-primary bg-clip-text font-parkinsans">
            Klinik Bumi Andalas
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 mb-8">
          Simulasi Klinik Terpadu untuk Manajemen Klinik Modern
        </p>

        <HeroAuthButtons />

        {/* Features Section */}
        <div className="mt-20 max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-center">Fitur Sistem Klinik</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🏥</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Registrasi & Antrian</h3>
                <p className="text-sm text-muted-foreground">Manajemen pendaftaran pasien dan sistem antrian terpadu</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Rekam Medis Elektronik</h3>
                <p className="text-sm text-muted-foreground">Dokumentasi medis digital berbasis SOAP</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💊</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Farmasi & Obat</h3>
                <p className="text-sm text-muted-foreground">Manajemen stok obat dan resep terintegrasi</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Billing & Keuangan</h3>
                <p className="text-sm text-muted-foreground">Sistem penagihan dan manajemen keuangan klinik</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-20 max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Tentang Simulasi Klinik</h2>
            <p className="text-lg text-muted-foreground">
              Platform simulasi klinik yang dirancang untuk mendukung manajemen klinik secara efektif dan efisien.
              Sistem ini membantu administrator klinik dalam memahami dan mengoptimalkan alur kerja klinik secara menyeluruh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-4">Misi Kami</h3>
              <p className="text-muted-foreground mb-4">
                Menyediakan solusi manajemen klinik yang efektif dan efisien dengan memanfaatkan teknologi informasi
                terkini untuk meningkatkan kualitas layanan kesehatan.
              </p>
              <h3 className="text-xl font-semibold mb-4">Target Pengguna</h3>
              <ul className="text-muted-foreground list-disc pl-5 space-y-2">
                <li>Administrator Klinik</li>
                <li>Pemilik Klinik</li>
                <li>Manajer Operasional Klinik</li>
                <li>Staff Administrasi Klinik</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Apa yang Membuat Kami Berbeda</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Antarmuka intuitif sesuai prinsip Simple UX</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Desain responsif untuk berbagai perangkat</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Alur kerja terintegrasi dari registrasi hingga discharge</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Fitur pelaporan dan analitik komprehensif</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 py-12 px-4 bg-primary/5 dark:bg-primary/10 rounded-xl max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Optimalkan Manajemen Klinik Anda</h2>
          <p className="text-lg text-center text-muted-foreground max-w-2xl mx-auto mb-8">
            Tingkatkan efisiensi operasional klinik dengan sistem manajemen terpadu kami
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <HeroAuthButtons />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Sim-Klinik - Klinik Bumi Andalas. Platform Simulasi Klinik untuk Manajemen Klinik.</p>
      </footer>
    </div>
  );
}
