"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { Poli } from "@/types/poli"
import { getPolisRequest } from "@/lib/services/poli.service"

const editVisitSchema = z.object({
  // Visit info
  poliId: z.string().optional(),
  doctorId: z.string().optional(),
  notes: z.string().optional(),
  // Triage (for emergency)
  triageStatus: z.enum(["red", "yellow", "green"]).optional(),
  chiefComplaint: z.string().optional(),
  // Vitals
  temperature: z.string().optional(),
  bloodPressureSystolic: z.coerce.number().int().optional().or(z.literal("")),
  bloodPressureDiastolic: z.coerce.number().int().optional().or(z.literal("")),
  pulse: z.coerce.number().int().optional().or(z.literal("")),
  respiratoryRate: z.coerce.number().int().optional().or(z.literal("")),
  oxygenSaturation: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
})

type EditVisitForm = z.infer<typeof editVisitSchema>

interface QueueItem {
  visit: {
    id: string
    visitNumber: string
    queueNumber: string | null
    visitType: string
    status: string
    arrivalTime: string
    triageStatus: string | null
    poliId: string | null
    doctorId: string | null
    notes: string | null
    chiefComplaint: string | null
  }
  patient: {
    id: string
    mrNumber: string
    name: string
    gender: string | null
    dateOfBirth: string | null
  }
}

interface EditVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  queueItem: QueueItem | null
  onSuccess?: () => void
}

export function EditVisitDialog({
  open,
  onOpenChange,
  queueItem,
  onSuccess,
}: EditVisitDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [polis, setPolis] = useState<Poli[]>([])
  const [isLoadingPolis, setIsLoadingPolis] = useState(true)

  const form = useForm<EditVisitForm>({
    resolver: zodResolver(editVisitSchema),
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

  // Reset form when queue item changes
  useEffect(() => {
    if (queueItem) {
      form.reset({
        poliId: queueItem.visit.poliId || "",
        doctorId: queueItem.visit.doctorId || "",
        notes: queueItem.visit.notes || "",
        triageStatus: (queueItem.visit.triageStatus as "red" | "yellow" | "green") || undefined,
        chiefComplaint: queueItem.visit.chiefComplaint || "",
        temperature: "",
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        pulse: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
        height: "",
      })
    }
  }, [queueItem, form])

  const handleSubmit = async (data: EditVisitForm) => {
    if (!queueItem) return

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
        const visitResponse = await fetch(`/api/visits/${queueItem.visit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(visitUpdateData),
        })

        if (!visitResponse.ok) {
          throw new Error("Failed to update visit")
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

        const vitalsResponse = await fetch(`/api/visits/${queueItem.visit.id}/vitals`, {
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
      toast.error("Gagal memperbarui data kunjungan")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!queueItem) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Kunjungan</DialogTitle>
          <DialogDescription>
            {queueItem.patient.name} ({queueItem.patient.mrNumber}) - {queueItem.visit.visitNumber}
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
                {queueItem.visit.visitType === "outpatient" && (
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
                )}

                {queueItem.visit.visitType === "emergency" && (
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
