"use client"

import { useState, useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Poli } from "@/types/poli"
import { getPolisRequest } from "@/lib/services/poli.service"
import { getDoctors } from "@/lib/services/doctor.service"
import {
  editVisitSchema,
  type EditVisitFormData,
  type EditVisitData,
} from "@/lib/validations/edit-visit"
import { VISIT_STATUS_INFO, type VisitStatus } from "@/types/visit-status"

interface Doctor {
  id: string
  name: string
}

interface EditVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitData: EditVisitData | null
  onSuccess?: () => void
}

export type { EditVisitData }

export function EditVisitDialog({
  open,
  onOpenChange,
  visitData,
  onSuccess,
}: EditVisitDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [polis, setPolis] = useState<Poli[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoadingPolis, setIsLoadingPolis] = useState(true)
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)

  const form = useForm<EditVisitFormData>({
    resolver: zodResolver(editVisitSchema) as unknown as Resolver<EditVisitFormData>,
    defaultValues: {
      poliId: "",
      doctorId: "",
      notes: "",
      triageStatus: undefined,
      chiefComplaint: "",
      temperature: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      pulse: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
    },
  })

  // Fetch polis
  useEffect(() => {
    const fetchPolis = async () => {
      try {
        const response = await getPolisRequest()
        setPolis(response?.data || [])
      } catch (error) {
        console.error("Error fetching polis:", error)
      } finally {
        setIsLoadingPolis(false)
      }
    }
    fetchPolis()
  }, [])

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await getDoctors()
        setDoctors(result || [])
      } catch (error) {
        console.error("Error fetching doctors:", error)
      } finally {
        setIsLoadingDoctors(false)
      }
    }
    fetchDoctors()
  }, [])

  // Reset form when visit data changes and fetch vitals
  useEffect(() => {
    if (!visitData || !open) return

    // Reset form with visit data
    form.reset({
      poliId: visitData.visit.poliId || "",
      doctorId: visitData.visit.doctorId || "",
      notes: visitData.visit.notes || "",
      triageStatus: (visitData.visit.triageStatus as "red" | "yellow" | "green") || undefined,
      chiefComplaint: visitData.visit.chiefComplaint || "",
      temperature: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      pulse: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
    })

    // Fetch existing vitals
    const fetchVitals = async () => {
      try {
        const response = await fetch(`/api/visits/${visitData.visit.id}/vitals`)
        if (response.ok) {
          const data = await response.json()
          const vitals = data.data
          if (vitals) {
            form.setValue("temperature", vitals.temperature || "")
            form.setValue("bloodPressureSystolic", vitals.bloodPressureSystolic ?? "")
            form.setValue("bloodPressureDiastolic", vitals.bloodPressureDiastolic ?? "")
            form.setValue("pulse", vitals.pulse ?? "")
            form.setValue("respiratoryRate", vitals.respiratoryRate ?? "")
            form.setValue("oxygenSaturation", vitals.oxygenSaturation || "")
            form.setValue("weight", vitals.weight || "")
            form.setValue("height", vitals.height || "")
          }
        }
      } catch (error) {
        console.error("Error fetching vitals:", error)
      }
    }
    fetchVitals()
  }, [visitData, open, form])

  const handleSubmit = async (data: EditVisitFormData) => {
    if (!visitData) return

    setIsSubmitting(true)
    try {
      // Update visit info
      const visitUpdateData: Record<string, unknown> = {}
      if (data.poliId) visitUpdateData.poliId = data.poliId
      if (data.doctorId) visitUpdateData.doctorId = data.doctorId
      if (data.notes !== undefined) visitUpdateData.notes = data.notes
      if (data.triageStatus) visitUpdateData.triageStatus = data.triageStatus
      if (data.chiefComplaint) visitUpdateData.chiefComplaint = data.chiefComplaint

      if (Object.keys(visitUpdateData).length > 0) {
        const visitResponse = await fetch(`/api/visits/${visitData.visit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(visitUpdateData),
        })

        if (!visitResponse.ok) {
          const errorData = await visitResponse.json().catch(() => null)
          throw new Error(errorData?.error || "Failed to update visit")
        }
      }

      // Update vitals if any provided
      const hasVitals =
        data.temperature ||
        data.bloodPressureSystolic ||
        data.bloodPressureDiastolic ||
        data.pulse ||
        data.respiratoryRate ||
        data.oxygenSaturation ||
        data.weight ||
        data.height

      if (hasVitals) {
        const vitalsData = {
          temperature: data.temperature || undefined,
          bloodPressureSystolic:
            typeof data.bloodPressureSystolic === "number" ? data.bloodPressureSystolic : undefined,
          bloodPressureDiastolic:
            typeof data.bloodPressureDiastolic === "number"
              ? data.bloodPressureDiastolic
              : undefined,
          pulse: typeof data.pulse === "number" ? data.pulse : undefined,
          respiratoryRate:
            typeof data.respiratoryRate === "number" ? data.respiratoryRate : undefined,
          oxygenSaturation: data.oxygenSaturation || undefined,
          weight: data.weight || undefined,
          height: data.height || undefined,
        }

        const vitalsResponse = await fetch(`/api/visits/${visitData.visit.id}/vitals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vitalsData),
        })

        if (!vitalsResponse.ok) {
          throw new Error("Failed to update vitals")
        }
      }

      toast.success("Data kunjungan berhasil diperbarui")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error updating visit:", error)
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data kunjungan")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!visitData) return null

  const statusInfo = VISIT_STATUS_INFO[visitData.visit.status as VisitStatus]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Kunjungan</DialogTitle>
          <DialogDescription>
            {visitData.patient.name} ({visitData.patient.mrNumber}) - {visitData.visit.visitNumber}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs defaultValue="visit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visit">Info Kunjungan</TabsTrigger>
                <TabsTrigger value="vitals">Tanda Vital</TabsTrigger>
              </TabsList>

              {/* Visit Info Tab */}
              <TabsContent value="visit" className="space-y-4 pt-4">
                {/* Status Badge */}
                {statusInfo && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                )}

                {visitData.visit.visitType === "outpatient" && (
                  <>
                    <FormField
                      control={form.control}
                      name="poliId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poliklinik</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoadingPolis}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih poli" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {polis.map((poli) => (
                                <SelectItem key={poli.id} value={poli.id}>
                                  {poli.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dokter</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoadingDoctors}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih dokter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {doctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  {doctor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {visitData.visit.visitType === "emergency" && (
                  <>
                    <FormField
                      control={form.control}
                      name="triageStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Triage</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status triage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="red">Merah (Darurat)</SelectItem>
                              <SelectItem value="yellow">Kuning (Mendesak)</SelectItem>
                              <SelectItem value="green">Hijau (Non-Urgent)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="chiefComplaint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keluhan Utama</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Keluhan utama pasien" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Catatan tambahan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Vitals Tab */}
              <TabsContent value="vitals" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suhu (C)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="36.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pulse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nadi (x/menit)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="80" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bloodPressureSystolic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tekanan Darah Sistolik</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="120" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bloodPressureDiastolic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tekanan Darah Diastolik</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="80" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="respiratoryRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Respirasi (x/menit)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="oxygenSaturation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SpO2 (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="98" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Berat Badan (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="60" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tinggi Badan (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="170" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
