"use client"

import { useRouter } from "next/navigation"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 pt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Akses Ditolak</h1>
            <p className="text-muted-foreground">
              Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator
              jika Anda merasa ini adalah kesalahan.
            </p>
          </div>

          <Button onClick={() => router.push("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
