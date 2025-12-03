"use client"

/**
 * Patient Discharge Form
 * Discharge summary with billing gate check
 */

import { useState, useEffect } from "react"
import { useDischarge } from "@/hooks/use-discharge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function DischargePage() {
  const [visitId, setVisitId] = useState("")
  const [canDischargeData, setCanDischargeData] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    admissionDiagnosis: "",
    dischargeDiagnosis: "",
    clinicalSummary: "",
    proceduresPerformed: "",
    medicationsOnDischarge: "",
    dischargeInstructions: "",
    dietaryRestrictions: "",
    activityRestrictions: "",
    followUpDate: "",
    followUpInstructions: "",
  })

  const { createDischargeSummary, checkCanDischarge, isSubmitting, isChecking, success, error } =
    useDischarge()

  // Check if can discharge when visitId changes
  useEffect(() => {
    const checkDischarge = async () => {
      if (visitId && !isNaN(parseInt(visitId))) {
        const result = await checkCanDischarge(parseInt(visitId))
        setCanDischargeData(result)
      }
    }

    checkDischarge()
  }, [visitId, checkCanDischarge])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!visitId) return

    const success = await createDischargeSummary({
      visitId: parseInt(visitId),
      ...formData,
      dischargedBy: "doctor-001", // TODO: Get from auth
    })

    if (success) {
      // Reset form
      setFormData({
        admissionDiagnosis: "",
        dischargeDiagnosis: "",
        clinicalSummary: "",
        proceduresPerformed: "",
        medicationsOnDischarge: "",
        dischargeInstructions: "",
        dietaryRestrictions: "",
        activityRestrictions: "",
        followUpDate: "",
        followUpInstructions: "",
      })
      setVisitId("")
      setCanDischargeData(null)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pasien Pulang</h1>
        <p className="text-muted-foreground">Buat ringkasan medis untuk pasien yang akan pulang</p>
      </div>

      {/* Visit ID Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cek Kelayakan Pulang</CardTitle>
          <CardDescription>Masukkan Visit ID untuk cek billing gate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Masukkan Visit ID"
                value={visitId}
                onChange={(e) => setVisitId(e.target.value)}
                type="number"
                disabled={isChecking}
              />
            </div>
            <Button
              onClick={() => visitId && checkCanDischarge(parseInt(visitId))}
              disabled={!visitId || isChecking}
            >
              {isChecking ? "Checking..." : "Cek"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Gate Status */}
      {canDischargeData && (
        <Alert
          className={`mb-6 ${
            canDischargeData.canDischarge
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          <AlertTitle className="flex items-center gap-2">
            {canDischargeData.canDischarge ? (
              <>
                <Badge className="bg-green-600">✓ Boleh Pulang</Badge>
                <span>Pembayaran LUNAS</span>
              </>
            ) : (
              <>
                <Badge className="bg-red-600">✗ Belum Boleh Pulang</Badge>
                <span>Pembayaran Belum Lunas</span>
              </>
            )}
          </AlertTitle>
          <AlertDescription>
            {canDischargeData.reason ||
              "Pasien dapat dipulangkan. Silakan isi ringkasan medis di bawah."}
          </AlertDescription>
        </Alert>
      )}

      {/* Discharge Form */}
      {canDischargeData?.canDischarge && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Medis Pulang</CardTitle>
              <CardDescription>Lengkapi informasi berikut sebelum pasien pulang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Admission Diagnosis */}
              <div>
                <Label htmlFor="admissionDiagnosis">
                  Diagnosis Masuk <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="admissionDiagnosis"
                  value={formData.admissionDiagnosis}
                  onChange={(e) => handleInputChange("admissionDiagnosis", e.target.value)}
                  placeholder="Diagnosis saat pasien masuk RS"
                  required
                />
              </div>

              {/* Discharge Diagnosis */}
              <div>
                <Label htmlFor="dischargeDiagnosis">
                  Diagnosis Pulang <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="dischargeDiagnosis"
                  value={formData.dischargeDiagnosis}
                  onChange={(e) => handleInputChange("dischargeDiagnosis", e.target.value)}
                  placeholder="Diagnosis final saat pasien pulang"
                  required
                />
              </div>

              {/* Clinical Summary */}
              <div>
                <Label htmlFor="clinicalSummary">
                  Ringkasan Klinis <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="clinicalSummary"
                  value={formData.clinicalSummary}
                  onChange={(e) => handleInputChange("clinicalSummary", e.target.value)}
                  placeholder="Perjalanan penyakit selama perawatan"
                  rows={5}
                  required
                />
              </div>

              {/* Procedures Performed */}
              <div>
                <Label htmlFor="proceduresPerformed">Tindakan yang Dilakukan</Label>
                <Textarea
                  id="proceduresPerformed"
                  value={formData.proceduresPerformed}
                  onChange={(e) => handleInputChange("proceduresPerformed", e.target.value)}
                  placeholder="Daftar tindakan medis yang telah dilakukan"
                />
              </div>

              {/* Medications on Discharge */}
              <div>
                <Label htmlFor="medicationsOnDischarge">Obat yang Dibawa Pulang</Label>
                <Textarea
                  id="medicationsOnDischarge"
                  value={formData.medicationsOnDischarge}
                  onChange={(e) => handleInputChange("medicationsOnDischarge", e.target.value)}
                  placeholder="Daftar obat untuk dilanjutkan di rumah"
                />
              </div>

              {/* Discharge Instructions */}
              <div>
                <Label htmlFor="dischargeInstructions">
                  Instruksi Pulang <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="dischargeInstructions"
                  value={formData.dischargeInstructions}
                  onChange={(e) => handleInputChange("dischargeInstructions", e.target.value)}
                  placeholder="Instruksi untuk pasien dan keluarga"
                  rows={4}
                  required
                />
              </div>

              {/* Dietary Restrictions */}
              <div>
                <Label htmlFor="dietaryRestrictions">Pantangan Makanan</Label>
                <Textarea
                  id="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => handleInputChange("dietaryRestrictions", e.target.value)}
                  placeholder="Makanan yang harus dihindari"
                />
              </div>

              {/* Activity Restrictions */}
              <div>
                <Label htmlFor="activityRestrictions">Pembatasan Aktivitas</Label>
                <Textarea
                  id="activityRestrictions"
                  value={formData.activityRestrictions}
                  onChange={(e) => handleInputChange("activityRestrictions", e.target.value)}
                  placeholder="Aktivitas yang harus dibatasi atau dihindari"
                />
              </div>

              {/* Follow-up Date */}
              <div>
                <Label htmlFor="followUpDate">Tanggal Kontrol</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange("followUpDate", e.target.value)}
                />
              </div>

              {/* Follow-up Instructions */}
              <div>
                <Label htmlFor="followUpInstructions">Instruksi Kontrol</Label>
                <Textarea
                  id="followUpInstructions"
                  value={formData.followUpInstructions}
                  onChange={(e) => handleInputChange("followUpInstructions", e.target.value)}
                  placeholder="Instruksi untuk kunjungan kontrol berikutnya"
                />
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {success && (
                <Alert className="border-green-500 bg-green-50">
                  <AlertTitle>Berhasil</AlertTitle>
                  <AlertDescription>
                    Ringkasan pulang berhasil dibuat. Pasien dapat dipulangkan.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                {isSubmitting ? "Memproses..." : "Pulangkan Pasien"}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}
