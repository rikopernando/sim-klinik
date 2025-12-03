"use client"

import { useState, useEffect } from "react"
import { QueueDisplay } from "@/components/visits/queue-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { getPolis, type Poli } from "@/lib/services/poli.service"

export default function QueuePage() {
  const [selectedPoli, setSelectedPoli] = useState<number | undefined>(undefined)
  const [polis, setPolis] = useState<Poli[]>([])
  const [isLoadingPolis, setIsLoadingPolis] = useState(true)

  // Fetch polis data from API using service
  useEffect(() => {
    const fetchPolis = async () => {
      try {
        const polisList = await getPolis()
        setPolis(polisList)
      } catch (error) {
        console.error("Error fetching polis:", error)
      } finally {
        setIsLoadingPolis(false)
      }
    }

    fetchPolis()
  }, [])

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Antrian Pasien</h1>
        <p className="text-muted-foreground">Lihat antrian pasien untuk setiap layanan</p>
      </div>

      {/* Queue Tabs */}
      <Tabs defaultValue="outpatient" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="outpatient">Rawat Jalan</TabsTrigger>
          <TabsTrigger value="emergency">UGD</TabsTrigger>
          <TabsTrigger value="inpatient">Rawat Inap</TabsTrigger>
        </TabsList>

        {/* Outpatient Queue */}
        <TabsContent value="outpatient" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filter Poli</CardTitle>
              <CardDescription>Pilih poli untuk melihat antrian spesifik</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="poli-filter">Poliklinik</Label>
                <Select
                  value={selectedPoli?.toString()}
                  onValueChange={(value) =>
                    setSelectedPoli(value === "all" ? undefined : parseInt(value))
                  }
                  disabled={isLoadingPolis}
                >
                  <SelectTrigger id="poli-filter">
                    {isLoadingPolis ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memuat...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Semua Poli" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Poli</SelectItem>
                    {polis.map((poli) => (
                      <SelectItem key={poli.id} value={poli.id.toString()}>
                        {poli.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <QueueDisplay
            visitType="outpatient"
            poliId={selectedPoli}
            autoRefresh={true}
            refreshInterval={30000}
          />
        </TabsContent>

        {/* Emergency Queue */}
        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Antrian Unit Gawat Darurat (UGD)</CardTitle>
              <CardDescription>
                Pasien diurutkan berdasarkan tingkat kegawatan (triage)
              </CardDescription>
            </CardHeader>
          </Card>

          <QueueDisplay
            visitType="emergency"
            autoRefresh={true}
            refreshInterval={15000} // Refresh faster for emergency
          />
        </TabsContent>

        {/* Inpatient Queue */}
        <TabsContent value="inpatient" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pasien Rawat Inap</CardTitle>
              <CardDescription>Pasien yang sedang dirawat di rumah sakit</CardDescription>
            </CardHeader>
          </Card>

          <QueueDisplay
            visitType="inpatient"
            autoRefresh={true}
            refreshInterval={60000} // Refresh every minute for inpatient
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
